from typing import Dict, List

from django.db import transaction
from django.utils.text import slugify

from orders.models import Order
from products.models import Product
from .api import (
    batch_change_inventory_for_sale,
    batch_retrieve_inventory_counts,
    list_catalog_items,
)


def _slug_for_variation(name: str, variation_id: str) -> str:
    """
    Build a reasonably unique slug using the variation name and id.
    Variation ids are stable and ensure uniqueness even if names collide.
    """
    base = slugify(name) or "product"
    suffix = slugify(variation_id)[:12] or variation_id[:12]
    slug = f"{base}-{suffix}" if suffix else base
    return slug[:50]


def sync_products_from_square() -> None:
    """
    Pull CatalogItem + CatalogImage objects from Square and sync them
    into our Product table.

    Rules:
    - Each ITEM_VARIATION becomes one Product.
    - Product.name = item name + variation name in parentheses if variation has a name.
    - Product.price_cents = price_money.amount (integer, in cents).
    - Product.image_url = primary image URL from ITEM.image_ids[0] -> IMAGE.image_data.url
    - Product.description = item's description from Square.
    - Product.category = category name from Square (requires CATEGORY objects).
    - Product.square_quantity/is_active are refreshed from Square Inventory when available.
    - Product.square_item_id, Product.square_variation_id are set from Square ids.
    - Existing Products matched by square_variation_id are updated.
    - New variations are inserted as new Products.
    - Products that have square_variation_id set but no longer exist in Square
      are marked is_active=False (soft deactivation).
    """
    objects = list_catalog_items()
    if not objects:
        return

    # Build image_id -> url map from IMAGE objects
    image_map: Dict[str, str] = {}
    for obj in objects:
        if obj.get("type") != "IMAGE":
            continue
        image_data = obj.get("image_data") or {}
        url = image_data.get("url")
        if url:
            image_map[obj["id"]] = url

    # Build category_id -> name map from CATEGORY objects
    category_map: Dict[str, str] = {}
    for obj in objects:
        if obj.get("type") != "CATEGORY":
            continue
        category_data = obj.get("category_data") or {}
        name = (category_data.get("name") or "").strip()
        if name:
            category_map[obj["id"]] = name

    variation_meta: Dict[str, dict] = {}

    # Build meta for each variation (ITEM_VARIATION)
    for obj in objects:
        if obj.get("type") != "ITEM":
            continue

        item_id = obj["id"]
        item_data = obj.get("item_data", {}) or {}
        item_name = (item_data.get("name") or "").strip()
        description = (item_data.get("description") or "").strip()

        # Square now returns categories as a list under item_data["categories"].
        # Fall back to legacy item_data["category_id"] and reporting_category if present.
        category_id = item_data.get("category_id") or ""
        if not category_id:
            categories = item_data.get("categories") or []
            if categories:
                category_id = categories[0].get("id") or ""
        if not category_id:
            reporting_category = item_data.get("reporting_category") or {}
            category_id = reporting_category.get("id") or ""

        category_name = category_map.get(category_id, "")
        image_ids = item_data.get("image_ids") or []
        primary_image_url = image_map.get(image_ids[0]) if image_ids else ""

        for variation in item_data.get("variations", []) or []:
            v_id = variation.get("id")
            if not v_id:
                continue

            v_data = variation.get("item_variation_data", {}) or {}

            v_name = (v_data.get("name") or "").strip()
            price_money = v_data.get("price_money") or {}
            amount = int(price_money.get("amount") or 0)

            if v_name:
                full_name = f"{item_name} ({v_name})"
            else:
                full_name = item_name

            variation_meta[v_id] = {
                "item_id": item_id,
                "name": full_name,
                "price_cents": amount,
                "image_url": primary_image_url or "",
                "main_image_url": primary_image_url or "",
                "description": description,
                "category": category_name,
            }

    variation_ids = list(variation_meta.keys())
    if not variation_ids:
        return

    # Fetch inventory counts so new/updated products include current stock levels
    counts: Dict[str, int] = batch_retrieve_inventory_counts(variation_ids)

    with transaction.atomic():
        existing = {
            p.square_variation_id: p
            for p in Product.objects.filter(square_variation_id__in=variation_ids)
        }

        seen_ids: set[str] = set()

        for v_id, meta in variation_meta.items():
            seen_ids.add(v_id)
            qty = counts.get(v_id) if counts else None

            defaults = {
                "name": meta["name"],
                "price_cents": meta["price_cents"],
                "square_item_id": meta["item_id"],
                "image_url": meta.get("image_url", ""),
                "main_image_url": meta.get("main_image_url", ""),
                "description": meta.get("description", ""),
                "category": meta.get("category", ""),
            }

            if qty is not None:
                defaults["square_quantity"] = qty
                defaults["is_active"] = qty > 0
            elif hasattr(Product, "is_active"):
                defaults["is_active"] = True

            product = existing.get(v_id)
            if product:
                for field, value in defaults.items():
                    setattr(product, field, value)
                product.save()
            else:
                Product.objects.create(
                    slug=_slug_for_variation(meta["name"], v_id),
                    square_variation_id=v_id,
                    **defaults,
                )

        # Deactivate products that disappeared from Square
        if hasattr(Product, "is_active"):
            Product.objects.filter(
                square_variation_id__isnull=False
            ).exclude(
                square_variation_id__in=seen_ids
            ).update(is_active=False)


def sync_inventory_from_square() -> None:
    """
    For all Products that have a square_variation_id, pull current IN_STOCK quantities
    from Square Inventory and update Product.square_quantity and is_active.

    - square_quantity = Square's IN_STOCK quantity at SQUARE_LOCATION_ID
    - is_active = (square_quantity > 0)
    """
    qs = Product.objects.exclude(square_variation_id="").exclude(square_variation_id__isnull=True)
    variation_ids: List[str] = list(qs.values_list("square_variation_id", flat=True))
    if not variation_ids:
        return

    counts = batch_retrieve_inventory_counts(variation_ids)

    with transaction.atomic():
        for product in qs:
            vid = product.square_variation_id
            if not vid:
                continue
            if vid not in counts:
                # If no count returned, skip or optionally set 0; here we skip
                continue

            qty = counts[vid]
            product.square_quantity = qty
            product.is_active = qty > 0
            product.save(update_fields=["square_quantity", "is_active"])


def decrement_square_inventory_for_order(order: Order) -> None:
    """
    When an order is successfully paid, decrement inventory in Square for each order item
    that is linked to a Square variation, and update local Product.square_quantity best-effort.
    """
    adjustments: list[dict] = []
    products_to_update: Dict[int, int] = {}  # product_id -> total_quantity_sold

    for item in order.items.select_related("product").all():
        product = item.product
        if not product.square_variation_id:
            continue

        qty = int(item.quantity)
        if qty <= 0:
            continue

        adjustments.append(
            {
                "square_variation_id": product.square_variation_id,
                "quantity": qty,
            }
        )
        products_to_update[product.id] = products_to_update.get(product.id, 0) + qty

    if not adjustments:
        return

    # Call Square Inventory API
    idempotency_key = f"order-{order.id}-sold"
    batch_change_inventory_for_sale(adjustments, idempotency_key=idempotency_key)

    # Best-effort local cache update
    from products.models import Product  # local import to avoid circular deps

    for product_id, qty in products_to_update.items():
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            continue

        new_qty = max(0, (product.square_quantity or 0) - qty)
        product.square_quantity = new_qty
        if new_qty <= 0:
            product.is_active = False
            product.save(update_fields=["square_quantity", "is_active"])
        else:
            product.save(update_fields=["square_quantity"])
