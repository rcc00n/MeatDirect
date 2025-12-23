from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price_cents = models.PositiveIntegerField()
    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True,
        help_text="Main product image (stored in S3 or local MEDIA_ROOT).",
    )
    main_image_url = models.URLField(blank=True)
    image_url = models.URLField(
        blank=True,
        default="",
        help_text="Primary product image hosted by Square (if available).",
    )
    category = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this product/variation is available for sale.",
    )
    is_popular = models.BooleanField(default=False)
    square_item_id = models.CharField(
        max_length=64,
        blank=True,
        db_index=True,
        help_text="Square Catalog ITEM id",
    )
    square_variation_id = models.CharField(
        max_length=64,
        blank=True,
        db_index=True,
        help_text="Square Catalog ITEM_VARIATION id",
    )
    square_quantity = models.IntegerField(
        default=0,
        help_text="Cached stock from Square Inventory (for this variation)",
    )

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, related_name="images", on_delete=models.CASCADE
    )
    image_url = models.URLField()
    alt_text = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]


class StorefrontSettings(models.Model):
    large_cuts_category = models.CharField(
        "Large cuts category",
        max_length=100,
        blank=True,
        default="",
        help_text=(
            "Product category to show on the Large Cuts page. "
            "Leave blank to use automatic large-cut detection."
        ),
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Storefront setting"
        verbose_name_plural = "Storefront settings"

    def __str__(self):
        category = self.large_cuts_category.strip()
        label = category or "Automatic"
        return f"Large cuts category: {label}"

    def save(self, *args, **kwargs):
        self.large_cuts_category = (self.large_cuts_category or "").strip()
        super().save(*args, **kwargs)
