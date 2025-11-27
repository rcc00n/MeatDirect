from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0002_product_image"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="square_item_id",
            field=models.CharField(
                blank=True,
                db_index=True,
                default="",
                help_text="Square Catalog ITEM id",
                max_length=64,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="product",
            name="square_variation_id",
            field=models.CharField(
                blank=True,
                db_index=True,
                default="",
                help_text="Square Catalog ITEM_VARIATION id",
                max_length=64,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="product",
            name="square_quantity",
            field=models.IntegerField(
                default=0,
                help_text="Cached stock from Square Inventory (for this variation)",
            ),
        ),
    ]
