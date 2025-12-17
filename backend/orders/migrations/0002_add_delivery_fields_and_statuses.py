from django.db import migrations, models


def map_statuses_forward(apps, _schema_editor):
    Order = apps.get_model("orders", "Order")
    mapping = {
        "pending": "placed",
        "paid": "processing",
        "in_progress": "processing",
        "ready": "shipped",
        "completed": "delivered",
        "cancelled": "cancelled",
    }
    for order in Order.objects.all():
        new_status = mapping.get(order.status)
        if new_status and new_status != order.status:
            order.status = new_status
            order.save(update_fields=["status"])


def map_statuses_backward(apps, _schema_editor):
    Order = apps.get_model("orders", "Order")
    mapping = {
        "placed": "pending",
        "processing": "in_progress",
        "shipped": "ready",
        "delivered": "completed",
        "cancelled": "cancelled",
    }
    for order in Order.objects.all():
        previous = mapping.get(order.status)
        if previous and previous != order.status:
            order.status = previous
            order.save(update_fields=["status"])


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="delivery_eta_text",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="order",
            name="delivery_fee_cents",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="order",
            name="delivery_service_area",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name="order",
            name="status",
            field=models.CharField(
                choices=[
                    ("placed", "Placed"),
                    ("processing", "Processing"),
                    ("shipped", "Shipped"),
                    ("delivered", "Delivered"),
                    ("cancelled", "Cancelled"),
                ],
                default="placed",
                max_length=20,
            ),
        ),
        migrations.RunPython(map_statuses_forward, map_statuses_backward),
    ]
