from django.db import models
from django.db import transaction
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from products.models import Product


class Order(models.Model):
    class OrderType(models.TextChoices):
        PICKUP = "pickup", "Pickup"
        DELIVERY = "delivery", "Delivery"

    class Status(models.TextChoices):
        PLACED = "placed", "Placed"
        PROCESSING = "processing", "Processing"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)

    order_type = models.CharField(max_length=20, choices=OrderType.choices)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PLACED
    )

    subtotal_cents = models.PositiveIntegerField(default=0)
    tax_cents = models.PositiveIntegerField(default=0)
    total_cents = models.PositiveIntegerField(default=0)
    delivery_fee_cents = models.PositiveIntegerField(default=0)
    delivery_service_area = models.CharField(max_length=100, blank=True)
    delivery_eta_text = models.CharField(max_length=255, blank=True)

    notes = models.TextField(blank=True)
    delivery_notes = models.TextField(blank=True)
    pickup_location = models.CharField(max_length=255, blank=True)
    pickup_instructions = models.TextField(blank=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id} - {self.full_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, related_name="items", on_delete=models.CASCADE
    )
    product = models.ForeignKey(
        Product, related_name="order_items", on_delete=models.PROTECT
    )
    product_name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    unit_price_cents = models.PositiveIntegerField()
    total_cents = models.PositiveIntegerField()

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"


@receiver(pre_save, sender=Order)
def _orders_store_previous_status(sender, instance: Order, raw=False, **kwargs):
    if raw or not instance.pk:
        instance._previous_status = ""
        return

    instance._previous_status = (
        Order.objects.filter(pk=instance.pk)
        .values_list("status", flat=True)
        .first()
        or ""
    )


@receiver(post_save, sender=Order)
def _orders_send_status_update_email(
    sender,
    instance: Order,
    created: bool,
    raw=False,
    update_fields=None,
    **kwargs,
):
    if raw or created:
        return
    if update_fields is not None and "status" not in update_fields:
        return

    previous_status = getattr(instance, "_previous_status", "") or ""
    if not previous_status or previous_status == instance.status:
        return

    order_id = instance.pk
    new_status = instance.status

    def _send_email():
        from notifications.emails import send_order_status_update_email

        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return
        send_order_status_update_email(
            order,
            previous_status=previous_status,
            new_status=new_status,
        )

    transaction.on_commit(_send_email)
