from django.contrib import admin

from .models import EmailNotification


@admin.register(EmailNotification)
class EmailNotificationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "kind",
        "to_email",
        "status",
        "created_at",
        "sent_at",
    )
