from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0005_product_is_active"),
    ]

    operations = [
        migrations.CreateModel(
            name="StorefrontSettings",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "large_cuts_category",
                    models.CharField(
                        blank=True,
                        default="",
                        help_text=(
                            "Product category to show on the Large Cuts page. "
                            "Leave blank to use automatic large-cut detection."
                        ),
                        max_length=100,
                        verbose_name="Large cuts category",
                    ),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Storefront setting",
                "verbose_name_plural": "Storefront settings",
            },
        ),
    ]
