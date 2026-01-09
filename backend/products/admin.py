from django import forms
from django.contrib import admin, messages
from django.core.exceptions import PermissionDenied
from django.core.management import call_command
from django.shortcuts import redirect
from django.urls import path
from django.utils.html import format_html

from .models import Product, ProductImage, StorefrontSettings


class StorefrontSettingsForm(forms.ModelForm):
    class Meta:
        model = StorefrontSettings
        fields = ("large_cuts_category",)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        categories = (
            Product.objects.exclude(category__isnull=True)
            .exclude(category__exact="")
            .values_list("category", flat=True)
            .distinct()
        )
        normalized = []
        for category in categories:
            value = (category or "").strip()
            if value:
                normalized.append(value)
        current_value = (self.instance.large_cuts_category or "").strip()
        if current_value:
            normalized.append(current_value)
        choices = [("", "Use automatic large-cut detection")]
        choices.extend((value, value) for value in sorted(set(normalized), key=str.casefold))
        field = self.fields["large_cuts_category"]
        field.required = False
        field.widget = forms.Select(choices=choices)
        field.choices = choices


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
            call_command("sync_square_products")
        except Exception as exc:  # pragma: no cover - defensive for admin trigger
            self.message_user(
                request,
                f"Square product sync failed: {exc}",
                level=messages.ERROR,
            )
            return redirect("admin:products_product_changelist")

        try:
            call_command("sync_square_inventory")
        except Exception as exc:  # pragma: no cover - defensive for admin trigger
            self.message_user(
                request,
                f"Square inventory sync failed: {exc}",
                level=messages.ERROR,
            )
        else:
            self.message_user(request, "Products and inventory synced with Square.")

        return redirect("admin:products_product_changelist")

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 150px; border-radius: 8px;" />',
                obj.image.url,
            )
        return "No image"

    image_preview.short_description = "Preview"


@admin.register(StorefrontSettings)
class StorefrontSettingsAdmin(admin.ModelAdmin):
    form = StorefrontSettingsForm
    list_display = ("large_cuts_category", "updated_at")
    fields = ("large_cuts_category",)

    def has_add_permission(self, request):
        if StorefrontSettings.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        return False
