import json
from datetime import timedelta

from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html

from .models import StaffLoginEvent


@admin.register(StaffLoginEvent)
class StaffLoginEventAdmin(admin.ModelAdmin):
    change_list_template = "admin/security/staffloginevent/change_list.html"
    change_form_template = "admin/security/staffloginevent/change_form.html"
    date_hierarchy = "created_at"
    list_display = ("employee_display", "device_display", "ip_display", "source_display", "created_at")
    list_filter = ("source", "device_type", ("created_at", admin.DateFieldListFilter))
    search_fields = (
        "user__username",
        "user__email",
        "username",
        "email",
        "ip_address",
        "forwarded_for",
        "location",
        "user_agent",
        "login_path",
        "host",
    )
    ordering = ("-created_at",)
    readonly_fields = (
        "created_at",
        "user",
        "username",
        "email",
        "source",
        "login_path",
        "host",
        "ip_address",
        "forwarded_for",
        "location",
        "device_type",
        "browser",
        "operating_system",
        "user_agent",
        "accept_language",
        "referer",
        "request_headers_pretty",
    )
    fieldsets = (
        ("Employee", {"fields": ("user", "username", "email")}),
        ("Login Event", {"fields": ("source", "login_path", "created_at")}),
        ("Network", {"fields": ("ip_address", "forwarded_for", "location", "host")}),
        ("Device", {"fields": ("device_type", "browser", "operating_system", "user_agent")}),
        ("Request", {"fields": ("accept_language", "referer", "request_headers_pretty")}),
    )

    @admin.display(description="Employee")
    def employee_display(self, obj):
        return format_html(
            '<div><strong>{}</strong>{}</div>',
            obj.employee_label,
            format_html('<div style="color:#475569;">{}</div>', obj.email) if obj.email else "",
        )

    @admin.display(description="Device")
    def device_display(self, obj):
        return format_html(
            '<div><strong>{}</strong>{}</div>',
            obj.device_label,
            format_html(
                '<div style="color:#475569;max-width:520px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{}</div>',
                obj.user_agent,
            )
            if obj.user_agent
            else "",
        )

    @admin.display(description="IP")
    def ip_display(self, obj):
        primary = obj.ip_address or "Unknown"
        secondary = obj.location or ""
        return format_html(
            '<div><strong>{}</strong>{}</div>',
            primary,
            format_html('<div style="color:#475569;">{}</div>', secondary) if secondary else "",
        )

    @admin.display(description="Source")
    def source_display(self, obj):
        return format_html(
            '<div><strong>{}</strong><div style="color:#475569;">{}</div></div>',
            obj.get_source_display(),
            obj.login_path,
        )

    @admin.display(description="Headers")
    def request_headers_pretty(self, obj):
        return format_html(
            '<pre style="white-space:pre-wrap;max-width:100%;overflow:auto;">{}</pre>',
            json.dumps(obj.request_headers, indent=2, sort_keys=True),
        )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("user")

    def changelist_view(self, request, extra_context=None):
        cutoff = timezone.now() - timedelta(days=30)
        recent = self.get_queryset(request).filter(created_at__gte=cutoff)
        summary = {
            "cutoff": cutoff,
            "total": recent.count(),
            "employees": recent.values("user_id").distinct().count(),
            "admin_total": recent.filter(source=StaffLoginEvent.Source.ADMIN).count(),
            "site_total": recent.filter(source=StaffLoginEvent.Source.SITE).count(),
        }
        extra_context = extra_context or {}
        extra_context["summary"] = summary
        return super().changelist_view(request, extra_context=extra_context)
