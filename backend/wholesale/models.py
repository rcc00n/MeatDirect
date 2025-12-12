from __future__ import annotations

import secrets
from datetime import datetime, timedelta

from django.contrib.auth.hashers import check_password, make_password
from django.db import models
from django.utils import timezone


def generate_access_code(length: int = 14) -> str:
    """Generate a URL-safe code admins can share with approved customers."""
    return secrets.token_urlsafe(length)


class WholesaleAccessKey(models.Model):
    label = models.CharField(max_length=255, help_text="Short note to identify where this key is used.")
    code_hash = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=255, blank=True)
    usage_count = models.PositiveIntegerField(default=0)
    last_used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Wholesale access key"
        verbose_name_plural = "Wholesale access keys"

    def __str__(self) -> str:
        return self.label or f"Wholesale key {self.id}"

    def set_code(self, raw_code: str) -> None:
        self.code_hash = make_password(raw_code)

    def check_code(self, raw_code: str) -> bool:
        if not raw_code:
            return False
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at <= timezone.now():
            return False
        return check_password(raw_code, self.code_hash)

    def record_use(self) -> None:
        self.usage_count = (self.usage_count or 0) + 1
        self.last_used_at = timezone.now()
        self.save(update_fields=["usage_count", "last_used_at"])

    def token_expiry(self, default_lifetime: timedelta) -> datetime:
        now = timezone.now()
        default_expiry = now + default_lifetime
        if self.expires_at:
            return min(self.expires_at, default_expiry)
        return default_expiry


class WholesaleAccessRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        DECLINED = "declined", "Declined"

    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    company = models.CharField(max_length=255, blank=True)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    access_key = models.ForeignKey(
        WholesaleAccessKey, null=True, blank=True, on_delete=models.SET_NULL, related_name="requests"
    )
    admin_notes = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Wholesale access request"
        verbose_name_plural = "Wholesale access requests"

    def __str__(self) -> str:
        return f"{self.name} ({self.email})"

    def mark_approved(self, key: WholesaleAccessKey | None = None, notes: str | None = None) -> None:
        self.status = self.Status.APPROVED
        self.access_key = key or self.access_key
        if notes:
            self.admin_notes = notes
        self.resolved_at = timezone.now()
        self.save(update_fields=["status", "access_key", "admin_notes", "resolved_at", "updated_at"])

    def mark_declined(self, notes: str | None = None) -> None:
        self.status = self.Status.DECLINED
        if notes:
            self.admin_notes = notes
        self.resolved_at = timezone.now()
        self.save(update_fields=["status", "admin_notes", "resolved_at", "updated_at"])
