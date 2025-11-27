from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0003_product_square_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="image_url",
            field=models.URLField(
                blank=True,
                default="",
                help_text="Primary product image hosted by Square (if available).",
            ),
        ),
    ]
