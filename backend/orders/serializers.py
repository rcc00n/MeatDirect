from rest_framework import serializers

from products.models import Product

from .models import Order, OrderItem
from .utils import DeliveryZoneError, calculate_tax_cents, get_delivery_quote


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class AddressSerializer(serializers.Serializer):
    line1 = serializers.CharField(required=False, allow_blank=True)
    line2 = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    postal_code = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)


class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id", read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_id",
            "product_name",
            "quantity",
            "unit_price_cents",
            "total_cents",
        ]
        read_only_fields = fields


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemInputSerializer(many=True)
    address = AddressSerializer(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
    pickup_location = serializers.CharField(required=False, allow_blank=True)
    pickup_instructions = serializers.CharField(required=False, allow_blank=True)
    delivery_notes = serializers.CharField(required=False, allow_blank=True)
    delivery_service_area = serializers.CharField(required=False, allow_blank=True, read_only=True)
    delivery_eta_text = serializers.CharField(required=False, allow_blank=True, read_only=True)
    delivery_fee_cents = serializers.IntegerField(required=False, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "order_type",
            "status",
            "items",
            "address",
            "notes",
            "pickup_location",
            "pickup_instructions",
            "delivery_notes",
            "delivery_service_area",
            "delivery_fee_cents",
            "delivery_eta_text",
        ]
        read_only_fields = [
            "id",
            "status",
            "delivery_service_area",
            "delivery_eta_text",
            "delivery_fee_cents",
        ]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("At least one item is required.")

        product_ids = [item["product_id"] for item in items]
        products = Product.objects.filter(id__in=product_ids)
        if products.count() != len(set(product_ids)):
            raise serializers.ValidationError("One or more products are unavailable.")
        return items

    def validate(self, attrs):
        order_type = attrs.get("order_type")
        address = attrs.get("address", {})
        required_delivery_fields = ["line1", "city", "postal_code"]

        self.delivery_quote = None

        if order_type == Order.OrderType.DELIVERY:
            missing = [f for f in required_delivery_fields if not address.get(f)]
            if missing:
                missing_fields = ", ".join(missing)
                raise serializers.ValidationError(
                    f"Delivery requires: {missing_fields}."
                )
            try:
                self.delivery_quote = get_delivery_quote(
                    address_line1=address.get("line1", ""),
                    city=address.get("city", ""),
                    postal_code=address.get("postal_code", ""),
                )
            except DeliveryZoneError as exc:
                raise serializers.ValidationError({"address": str(exc)})
        elif order_type == Order.OrderType.PICKUP:
            # For pickup we only require contact details which are already validated by fields.
            pass
        else:
            raise serializers.ValidationError(
                {"order_type": "Invalid order type."}
            )

        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        address_data = validated_data.pop("address", {})
        delivery_notes = validated_data.pop("delivery_notes", "")

        product_ids = [item["product_id"] for item in items_data]
        products = Product.objects.filter(id__in=product_ids)
        product_map = {product.id: product for product in products}

        subtotal = 0
        for item in items_data:
            product = product_map[item["product_id"]]
            subtotal += product.price_cents * item["quantity"]

        delivery_fee_cents = 0
        delivery_service_area = ""
        delivery_eta_text = ""
        if validated_data.get("order_type") == Order.OrderType.DELIVERY:
            if not self.delivery_quote:
                self.delivery_quote = get_delivery_quote(
                    address_line1=address_data.get("line1", ""),
                    city=address_data.get("city", ""),
                    postal_code=address_data.get("postal_code", ""),
                )
            delivery_fee_cents = self.delivery_quote.fee_cents
            delivery_service_area = self.delivery_quote.service_area
            delivery_eta_text = self.delivery_quote.eta_text

        tax_cents = calculate_tax_cents(subtotal, delivery_fee_cents)
        total_cents = subtotal + delivery_fee_cents + tax_cents

        order = Order.objects.create(
            address_line1=address_data.get("line1", ""),
            address_line2=address_data.get("line2", ""),
            city=address_data.get("city", ""),
            postal_code=address_data.get("postal_code", ""),
            delivery_notes=delivery_notes or address_data.get("notes", ""),
            delivery_service_area=delivery_service_area,
            delivery_fee_cents=delivery_fee_cents,
            delivery_eta_text=delivery_eta_text,
            subtotal_cents=subtotal,
            tax_cents=tax_cents,
            total_cents=total_cents,
            status=Order.Status.PLACED,
            **validated_data,
        )

        order_items = []
        for item in items_data:
            product = product_map[item["product_id"]]
            unit_price = product.price_cents
            quantity = item["quantity"]
            order_items.append(
                OrderItem(
                    order=order,
                    product=product,
                    product_name=product.name,
                    quantity=quantity,
                    unit_price_cents=unit_price,
                    total_cents=unit_price * quantity,
                )
            )
        OrderItem.objects.bulk_create(order_items)
        return order


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "order_type",
            "status",
            "subtotal_cents",
            "tax_cents",
            "total_cents",
            "delivery_fee_cents",
            "delivery_service_area",
            "delivery_eta_text",
            "address_line1",
            "address_line2",
            "city",
            "postal_code",
            "notes",
            "delivery_notes",
            "pickup_location",
            "pickup_instructions",
            "items",
            "created_at",
        ]
        read_only_fields = fields
