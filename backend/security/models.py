from django.conf import settings
from django.db import models


class StaffLoginEvent(models.Model):
    class Source(models.TextChoices):
        ADMIN = "admin", "Admin"
        SITE = "site", "Site"
        API = "api", "API"
        OTHER = "other", "Other"

    class DeviceType(models.TextChoices):
        DESKTOP = "desktop", "Desktop"
        MOBILE = "mobile", "Mobile"
        TABLET = "tablet", "Tablet"
        BOT = "bot", "Bot"
        UNKNOWN = "unknown", "Unknown"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="staff_login_events",
    )
    username = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    source = models.CharField(max_length=16, choices=Source.choices, default=Source.OTHER)
    login_path = models.CharField(max_length=255)
    host = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    forwarded_for = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    user_agent = models.TextField(blank=True)
    device_type = models.CharField(max_length=16, choices=DeviceType.choices, default=DeviceType.UNKNOWN)
    browser = models.CharField(max_length=64, blank=True)
    operating_system = models.CharField(max_length=64, blank=True)
    accept_language = models.CharField(max_length=255, blank=True)
    referer = models.TextField(blank=True)
    request_headers = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Staff login event"
        verbose_name_plural = "Staff login history"
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["user", "created_at"]),
            models.Index(fields=["source", "created_at"]),
        ]

    def __str__(self):
        return f"{self.username} via {self.get_source_display()} at {self.created_at:%Y-%m-%d %H:%M:%S}"

    @property
    def employee_label(self) -> str:
        full_name = self.user.get_full_name().strip()
        return full_name or self.username

    @property
    def device_label(self) -> str:
        parts = [self.get_device_type_display()]
        browser_os = " on ".join(part for part in [self.browser, self.operating_system] if part)
        if browser_os:
            parts.append(browser_os)
        return " · ".join(parts)

