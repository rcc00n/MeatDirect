from django.contrib import admin

from .models import Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image_url", "alt_text", "sort_order")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price_cents", "is_popular")
    list_filter = ("category", "is_popular")
    search_fields = ("name", "slug", "category")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline]
