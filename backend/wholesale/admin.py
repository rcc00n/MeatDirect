from __future__ import annotations

from typing import Any
from datetime import timedelta

from django import forms
from django.contrib import admin, messages
from django.utils import timezone
from django.utils.html import format_html, format_html_join

from .models import WholesaleAccessKey, WholesaleAccessRequest, generate_access_code


class WholesaleAccessKeyForm(forms.ModelForm):
    code_plaintext = forms.CharField(
        required=False,
        help_text="Provide a code to use for this key. Leave blank to keep the existing code.",
        widget=forms.TextInput(attrs={"autocomplete": "new-password"}),
    )

    class Meta:
        model = WholesaleAccessKey
        fields = ["label", "is_active", "expires_at", "created_by", "code_plaintext"]

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        if not self.instance.pk:
            self.fields["code_plaintext"].required = True

    def clean(self) -> dict[str, Any]:
        cleaned = super().clean()
        if not cleaned.get("code_plaintext") and not self.instance.code_hash:
            raise forms.ValidationError("An access code is required for new keys.")
        return cleaned

    def save(self, commit: bool = True) -> WholesaleAccessKey:
        obj: WholesaleAccessKey = super().save(commit=False)
        code_plaintext = self.cleaned_data.get("code_plaintext")
        if code_plaintext:
            obj.set_code(code_plaintext)
        if commit:
            obj.save()
        return obj


@admin.register(WholesaleAccessKey)
class WholesaleAccessKeyAdmin(admin.ModelAdmin):
    form = WholesaleAccessKeyForm
    list_display = ("label", "is_active", "expires_at", "usage_count", "last_used_at", "created_at")
    list_filter = ("is_active", ("expires_at", admin.EmptyFieldListFilter), ("created_at", admin.DateFieldListFilter))
    search_fields = ("label", "created_by")
    readonly_fields = ("usage_count", "last_used_at", "created_at", "code_hint")
    fieldsets = (
        (None, {"fields": ("label", "is_active", "expires_at", "created_by")}),
        ("Code", {"fields": ("code_plaintext", "code_hint")}),
        ("Usage", {"fields": ("usage_count", "last_used_at", "created_at")}),
    )
    actions = ["generate_new_codes"]

    def code_hint(self, obj: WholesaleAccessKey) -> str:
        return "Set or rotate the code above. The hashed value is stored securely and cannot be recovered."

    @admin.action(description="Generate and rotate new codes")
    def generate_new_codes(self, request, queryset):
        rotated = []
        for key in queryset:
            new_code = generate_access_code(10)
            key.set_code(new_code)
            key.save(update_fields=["code_hash", "updated_at"] if hasattr(key, "updated_at") else ["code_hash"])
            rotated.append((key.label or f"Key {key.id}", new_code))

        if not rotated:
            self.message_user(request, "No keys were updated.", level=messages.WARNING)
            return

        self.message_user(
            request,
            format_html(
                "New codes generated:<br>{}",
                format_html_join(
                    "<br>",
                    "<strong>{}</strong>: {}",
                    ((label, code) for label, code in rotated),
                ),
            ),
            level=messages.SUCCESS,
        )


@admin.register(WholesaleAccessRequest)
class WholesaleAccessRequestAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "company", "status_badge", "created_at", "resolved_at", "access_key")
    list_filter = ("status", ("created_at", admin.DateFieldListFilter), ("resolved_at", admin.DateFieldListFilter))
    search_fields = ("name", "email", "company")
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("access_key",)
    fieldsets = (
        ("Request", {"fields": ("name", "email", "phone", "company", "message")}),
        ("Review", {"fields": ("status", "access_key", "admin_notes", "resolved_at")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
    actions = ["approve_and_issue_codes", "mark_declined"]

    def status_badge(self, obj: WholesaleAccessRequest):
        colors = {
            obj.Status.PENDING: ("#fef3c7", "#a16207"),
            obj.Status.APPROVED: ("#dcfce7", "#166534"),
            obj.Status.DECLINED: ("#fee2e2", "#b91c1c"),
        }
        bg, color = colors.get(obj.status, ("#e5e7eb", "#111827"))
        return format_html(
            '<span style="padding:2px 8px;border-radius:12px;background:{};color:{};font-weight:700;text-transform:capitalize;">{}</span>',
            bg,
            color,
            obj.get_status_display(),
        )

    status_badge.short_description = "Status"

    @admin.action(description="Approve and issue new access code")
    def approve_and_issue_codes(self, request, queryset):
        issued = []
        for req in queryset:
            if req.status != req.Status.PENDING:
                continue

            code = generate_access_code(10)
            key = WholesaleAccessKey(
                label=f"Request {req.id} - {req.name}",
                created_by=request.user.get_username() if request.user and request.user.is_authenticated else "",
                expires_at=timezone.now() + timedelta(days=30),
            )
            key.set_code(code)
            key.save()

            req.status = req.Status.APPROVED
            req.access_key = key
            req.resolved_at = timezone.now()
            req.save(update_fields=["status", "access_key", "resolved_at", "updated_at"])
            issued.append((req.name, req.email, code))

        if not issued:
            self.message_user(request, "No pending requests were approved.", level=messages.WARNING)
            return

        self.message_user(
            request,
            format_html(
                "Approved and issued codes:<br>{}",
                format_html_join("<br>", "{} ({}) → {}", ((name, email, code) for name, email, code in issued)),
            ),
            level=messages.SUCCESS,
        )

    @admin.action(description="Mark as declined")
    def mark_declined(self, request, queryset):
        updated = queryset.filter(status=WholesaleAccessRequest.Status.PENDING).update(
            status=WholesaleAccessRequest.Status.DECLINED,
            resolved_at=timezone.now(),
        )
        if updated:
            self.message_user(request, f"{updated} request(s) declined.", level=messages.INFO)
        else:
            self.message_user(request, "No pending requests to decline.", level=messages.WARNING)
