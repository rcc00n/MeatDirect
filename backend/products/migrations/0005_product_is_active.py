from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0004_product_image_url"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="is_active",
            field=models.BooleanField(
                default=True,
                help_text="Whether this product/variation is available for sale.",
            ),
        ),
    ]
