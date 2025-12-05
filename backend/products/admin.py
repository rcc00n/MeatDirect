from django.contrib import admin, messages
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect
from django.urls import path
from django.utils.html import format_html

from square_sync.services import sync_products_from_square

from .models import Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image_url", "alt_text", "sort_order")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    change_list_template = "admin/products/product/change_list.html"
    list_display = ("name", "category", "price_cents", "is_popular", "image_preview")
    list_filter = ("category", "is_popular")
    search_fields = ("name", "slug", "category")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("image_preview",)
    fields = (
        "name",
        "slug",
        "description",
        "price_cents",
        "image",
        "main_image_url",
        "category",
        "is_popular",
        "image_preview",
    )
    inlines = [ProductImageInline]

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "sync-square/",
                self.admin_site.admin_view(self.sync_with_square),
                name="products_product_sync_square",
            ),
        ]
        return custom_urls + urls

    def sync_with_square(self, request):
        if not request.user.has_perm("products.change_product"):
            raise PermissionDenied

        try:
            sync_products_from_square()
        except Exception as exc:  # pragma: no cover - defensive for admin trigger
            self.message_user(
                request, f"Square sync failed: {exc}", level=messages.ERROR
            )
        else:
            self.message_user(request, "Products synced with Square.")

        return redirect("admin:products_product_changelist")

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 150px; border-radius: 8px;" />',
                obj.image.url,
            )
        return "No image"

    image_preview.short_description = "Preview"
