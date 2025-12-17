from django.contrib import admin
from django.core.exceptions import PermissionDenied
from django.db.models import Sum
from django.shortcuts import get_object_or_404, redirect
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils import timezone
from django.utils.html import format_html
from django.utils.html import format_html_join

from notifications.models import EmailNotification

from .models import Order, OrderItem
from .utils import calculate_tax_cents

STATUS_COLORS = {
    Order.Status.PLACED: ("#fef9c3", "#854d0e"),  # yellow
    Order.Status.PROCESSING: ("#dbeafe", "#1d4ed8"),  # blue
    Order.Status.SHIPPED: ("#fff7ed", "#c2410c"),  # orange
    Order.Status.DELIVERED: ("#ecfdf3", "#15803d"),  # green
    Order.Status.CANCELLED: ("#fef2f2", "#b91c1c"),  # red
}

ORDER_TYPE_COLORS = {
    Order.OrderType.PICKUP: ("#e0f2fe", "#0369a1"),
    Order.OrderType.DELIVERY: ("#dcfce7", "#166534"),
}


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    fields = ("product", "product_name", "quantity", "unit_price_cents", "total_cents")
    readonly_fields = ("product_name", "unit_price_cents", "total_cents")
    show_change_link = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "full_name",
        "order_type_badge",
        "delivery_badge",
        "colored_status",
        "status_shortcuts",
        "display_total",
        "created_at",
        "latest_receipt_link",
    )
    list_display_links = ("id", "full_name")
    list_filter = (
        "status",
        "order_type",
        "delivery_service_area",
        ("created_at", admin.DateFieldListFilter),
    )
    search_fields = ("full_name", "email", "id")
    readonly_fields = (
        "order_type_badge",
        "colored_status",
        "subtotal_cents",
        "tax_cents",
        "total_cents",
        "stripe_payment_intent_id",
        "created_at",
        "updated_at",
        "latest_receipt_link",
    )
    fieldsets = (
        (
            "Order",
            {
                "fields": (
                    "order_type",
                    "status",
                    "order_type_badge",
                    "colored_status",
                    "notes",
                )
            },
        ),
        (
            "Customer",
            {"fields": ("full_name", "email", "phone")},
        ),
        (
            "Delivery Details",
            {
                "fields": (
                    "address_line1",
                    "address_line2",
                    "city",
                    "postal_code",
                    "delivery_service_area",
                    "delivery_eta_text",
                    "delivery_notes",
                )
            },
        ),
        (
            "Pickup Details",
            {
                "fields": (
                    "pickup_location",
                    "pickup_instructions",
                )
            },
        ),
        (
            "Totals",
            {
                "fields": (
                    "subtotal_cents",
                    "tax_cents",
                    "delivery_fee_cents",
                    "total_cents",
                    "stripe_payment_intent_id",
                )
            },
        ),
        ("Metadata", {"fields": ("created_at", "updated_at")}),
    )
    inlines = [OrderItemInline]
    actions = [
        "mark_placed",
        "mark_processing",
        "mark_shipped",
        "mark_delivered",
        "mark_cancelled",
    ]

    def order_type_badge(self, obj):
        bg, color = ORDER_TYPE_COLORS.get(
            obj.order_type, ("#e5e7eb", "#1f2937")
        )
        return format_html(
            '<span style="padding:4px 8px;border-radius:999px;background:{};color:{};font-weight:700;">{}</span>',
            bg,
            color,
            obj.get_order_type_display(),
        )

    order_type_badge.short_description = "Order Type"
    order_type_badge.admin_order_field = "order_type"

    def delivery_badge(self, obj):
        if obj.order_type != Order.OrderType.DELIVERY:
            return "Pickup"

        area = obj.delivery_service_area or obj.city or "Delivery"
        fee = f"${obj.delivery_fee_cents / 100:.0f}" if obj.delivery_fee_cents else "$0"
        eta = obj.delivery_eta_text or ""
        return format_html(
            '<div style="line-height:1.35;"><strong>{}</strong> <span style="color:#475569;">{}</span>'
            '{}'
            "</div>",
            area,
            fee,
            format_html(
                '<div style="color:#475569;font-size:12px;">{}</div>', eta
            )
            if eta
            else "",
        )

    delivery_badge.short_description = "Delivery"

    def colored_status(self, obj):
        bg, color = STATUS_COLORS.get(obj.status, ("#e5e7eb", "#1f2937"))
        return format_html(
            '<span style="padding:4px 8px;border-radius:8px;background:{};color:{};font-weight:700;text-transform:capitalize;">{}</span>',
            bg,
            color,
            obj.get_status_display(),
        )

    colored_status.short_description = "Status"
    colored_status.admin_order_field = "status"

    def display_total(self, obj):
        return f"${obj.total_cents / 100:.2f}"

    display_total.short_description = "Total"
    display_total.admin_order_field = "total_cents"

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for obj in formset.deleted_objects:
            obj.delete()
        for instance in instances:
            instance.product_name = instance.product.name
            instance.unit_price_cents = instance.product.price_cents
            instance.total_cents = instance.unit_price_cents * instance.quantity
            instance.save()
        formset.save_m2m()
        self._recalculate_totals(form.instance)

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        self._recalculate_totals(obj)

    def _recalculate_totals(self, order):
        subtotal = sum(item.total_cents for item in order.items.all())
        delivery_fee = order.delivery_fee_cents or 0
        tax_cents = calculate_tax_cents(subtotal, delivery_fee)
        order.subtotal_cents = subtotal
        order.tax_cents = tax_cents
        order.total_cents = subtotal + delivery_fee + tax_cents
        order.save(
            update_fields=[
                "subtotal_cents",
                "tax_cents",
                "delivery_fee_cents",
                "total_cents",
                "updated_at",
            ]
        )

    @admin.action(description="Mark as Placed")
    def mark_placed(self, request, queryset):
        updated = queryset.update(
            status=Order.Status.PLACED, updated_at=timezone.now()
        )
        self.message_user(request, f"{updated} order(s) marked Placed.")

    @admin.action(description="Mark as Processing")
    def mark_processing(self, request, queryset):
        updated = queryset.update(
            status=Order.Status.PROCESSING, updated_at=timezone.now()
        )
        self.message_user(request, f"{updated} order(s) marked Processing.")

    @admin.action(description="Mark as Shipped/Out for delivery")
    def mark_shipped(self, request, queryset):
        updated = queryset.update(
            status=Order.Status.SHIPPED, updated_at=timezone.now()
        )
        self.message_user(request, f"{updated} order(s) marked Shipped.")

    @admin.action(description="Mark as Delivered")
    def mark_delivered(self, request, queryset):
        updated = queryset.update(
            status=Order.Status.DELIVERED, updated_at=timezone.now()
        )
        self.message_user(request, f"{updated} order(s) marked Delivered.")

    @admin.action(description="Mark as Cancelled")
    def mark_cancelled(self, request, queryset):
        updated = queryset.update(
            status=Order.Status.CANCELLED, updated_at=timezone.now()
        )
        self.message_user(request, f"{updated} order(s) marked Cancelled.")

    def status_shortcuts(self, obj):
        # Render a compact dropdown for changing status instead of multiple tiny buttons
        options = [
            format_html('<option value="">{}</option>', "Change status…"),
        ]
        for status_value, label in [
            (Order.Status.PLACED, "Placed"),
            (Order.Status.PROCESSING, "Processing"),
            (Order.Status.SHIPPED, "Shipped"),
            (Order.Status.DELIVERED, "Delivered"),
            (Order.Status.CANCELLED, "Cancelled"),
        ]:
            if obj.status == status_value:
                continue
            url = reverse("admin:orders_order_set_status", args=[obj.pk, status_value])
            options.append(format_html('<option value="{}">{}</option>', url, label))

        return format_html(
            '<select style="min-width:150px;padding:4px 8px;border-radius:8px;'
            'border:1px solid #d1d5db;background:#0f172a;color:#e5e7eb;" '
            'onchange="if(this.value){{window.location.href=this.value;this.selectedIndex=0;}}">'
            "{}</select>",
            format_html_join("", "{}", ((option,) for option in options)),
        )

    status_shortcuts.short_description = "Quick Status"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "<int:order_id>/set-status/<str:new_status>/",
                self.admin_site.admin_view(self.set_status),
                name="orders_order_set_status",
            )
        ]
        return custom_urls + urls

    def set_status(self, request, order_id, new_status):
        if not request.user.has_perm("orders.change_order"):
            raise PermissionDenied
        if new_status not in Order.Status.values:
            self.message_user(request, "Invalid status.", level="error")
            return redirect("admin:orders_order_changelist")
        order = get_object_or_404(Order, pk=order_id)
        order.status = new_status
        order.updated_at = timezone.now()
        order.save(update_fields=["status", "updated_at"])
        self.message_user(
            request,
            f"Order #{order.id} updated to {order.get_status_display()}.",
        )
        referer = request.META.get("HTTP_REFERER")
        if referer:
            return redirect(referer)
        return redirect("admin:orders_order_changelist")

    def latest_receipt_link(self, obj):
        notification = (
            EmailNotification.objects.filter(
                order=obj, kind="order_receipt"
            )
            .order_by("-sent_at", "-created_at")
            .first()
        )
        if not notification:
            return "—"
        if notification.receipt_pdf:
            return format_html(
                '<a href="{}" target="_blank" rel="noopener">Receipt PDF</a>',
                notification.receipt_pdf.url,
            )
        url = reverse(
            "admin:notifications_emailnotification_change",
            args=[notification.pk],
        )
        return format_html('<a href="{}">Notification</a>', url)

    latest_receipt_link.short_description = "Latest Receipt"


def orders_dashboard(request):
    today = timezone.now().date()
    todays_orders = Order.objects.filter(created_at__date=today)
    revenue_today_cents = (
        todays_orders.aggregate(total=Sum("total_cents"))["total"] or 0
    )
    context = {
        **admin.site.each_context(request),
        "title": "Orders Dashboard",
        "total_orders_today": todays_orders.count(),
        "placed_orders": Order.objects.filter(status=Order.Status.PLACED).count(),
        "processing_orders": Order.objects.filter(
            status=Order.Status.PROCESSING
        ).count(),
        "shipped_orders": Order.objects.filter(status=Order.Status.SHIPPED).count(),
        "delivered_orders_today": todays_orders.filter(
            status=Order.Status.DELIVERED
        ).count(),
        "revenue_today": revenue_today_cents,
        "revenue_today_display": revenue_today_cents / 100,
        "placed_url": reverse("admin:orders_order_changelist") + "?status=placed",
        "processing_url": reverse("admin:orders_order_changelist") + "?status=processing",
        "shipped_url": reverse("admin:orders_order_changelist") + "?status=shipped",
        "add_order_url": reverse("admin:orders_order_add"),
    }
    return TemplateResponse(request, "admin/orders_dashboard.html", context)


def get_admin_urls(urls):
    def wrapper():
        custom_urls = [
            path(
                "orders-dashboard/",
                admin.site.admin_view(orders_dashboard),
                name="orders-dashboard",
            ),
        ]
        return custom_urls + urls()

    return wrapper


admin.site.get_urls = get_admin_urls(admin.site.get_urls)
