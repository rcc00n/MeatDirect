from typing import Dict, List

import requests
from django.conf import settings
from django.utils import timezone


def _headers() -> dict:
    return {
        "Square-Version": settings.SQUARE_API_VERSION,
        "Authorization": f"Bearer {settings.SQUARE_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }


def list_catalog_items() -> list[dict]:
    """
    Use ListCatalog to get all ITEM and IMAGE objects (with pagination).
    Equivalent to the cURL from the docs:

    curl https://connect.squareupsandbox.com/v2/catalog/list?types=ITEM,IMAGE,CATEGORY \\
      -H 'Square-Version: 2025-10-16' \\
      -H 'Authorization: Bearer {ACCESS_TOKEN}' \\
      -H 'Content-Type: application/json'
    """
    if not settings.SQUARE_ACCESS_TOKEN:
        return []

    base_url = settings.SQUARE_BASE_URL.rstrip("/")
    url = f"{base_url}/catalog/list"

    # Request ITEM, IMAGE, CATEGORY types so we can attach descriptions and category names
    params: dict = {"types": "ITEM,IMAGE,CATEGORY"}
    objects: list[dict] = []
    cursor: str | None = None

    while True:
        if cursor:
            params["cursor"] = cursor

        resp = requests.get(url, headers=_headers(), params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        objects.extend(data.get("objects", []))
        cursor = data.get("cursor")
        if not cursor:
            break

    return objects


def batch_retrieve_inventory_counts(variation_ids: List[str]) -> Dict[str, int]:
    """
    Fetch current IN_STOCK quantities from Square Inventory for the given item variation IDs.

    Returns: {variation_id: quantity_int}
    Uses POST /v2/inventory/counts/batch-retrieve
    """
    if not settings.SQUARE_ACCESS_TOKEN or not settings.SQUARE_LOCATION_ID:
        return {}

    if not variation_ids:
        return {}

    base_url = settings.SQUARE_BASE_URL.rstrip("/")
    url = f"{base_url}/inventory/counts/batch-retrieve"

    result: Dict[str, int] = {}

    CHUNK = 100  # safe chunk size
    for i in range(0, len(variation_ids), CHUNK):
        chunk = variation_ids[i : i + CHUNK]
        body = {
            "catalog_object_ids": chunk,
            "location_ids": [settings.SQUARE_LOCATION_ID],
            "states": ["IN_STOCK"],
        }
        resp = requests.post(url, headers=_headers(), json=body, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        for count in data.get("counts", []):
            if (
                count.get("location_id") == settings.SQUARE_LOCATION_ID
                and count.get("state") == "IN_STOCK"
            ):
                vid = count.get("catalog_object_id")
                qty_str = count.get("quantity", "0")
                try:
                    qty = int(qty_str)
                except (TypeError, ValueError):
                    qty = 0
                if vid:
                    result[vid] = qty

    return result


def batch_change_inventory_for_sale(adjustments: List[dict], idempotency_key: str) -> None:
    """
    Apply inventory ADJUSTMENT changes in Square to mark items as SOLD.

    Each adjustment dict must contain:
      - square_variation_id (str)
      - quantity (int)
    Uses POST /v2/inventory/changes/batch-create
    """
    if not settings.SQUARE_ACCESS_TOKEN or not settings.SQUARE_LOCATION_ID:
        return

    if not adjustments:
        return

    base_url = settings.SQUARE_BASE_URL.rstrip("/")
    url = f"{base_url}/inventory/changes/batch-create"

    occurred_at = timezone.now().isoformat()
    changes_payload: List[dict] = []

    for adj in adjustments:
        vid = adj.get("square_variation_id")
        quantity = int(adj.get("quantity", 0))
        if not vid or quantity <= 0:
            continue

        changes_payload.append(
            {
                "type": "ADJUSTMENT",
                "adjustment": {
                    "from_state": "IN_STOCK",
                    "to_state": "SOLD",
                    "location_id": settings.SQUARE_LOCATION_ID,
                    "catalog_object_id": vid,
                    "quantity": str(quantity),
                    "occurred_at": occurred_at,
                },
            }
        )

    if not changes_payload:
        return

    body = {
        "idempotency_key": idempotency_key,
        "changes": changes_payload,
    }

    resp = requests.post(url, headers=_headers(), json=body, timeout=10)
    if not resp.ok:
        # Log only; don't raise (we don't want to break Stripe webhook)
        try:
            data = resp.json()
        except Exception:
            data = resp.text
        print("Square batch_change_inventory_for_sale error:", resp.status_code, data)
