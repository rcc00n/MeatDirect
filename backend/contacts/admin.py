from django.contrib import admin

from .models import QuoteRequest


@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "email", "fulfillment", "created_at")
    search_fields = ("name", "phone", "email", "message")
    list_filter = ("fulfillment", "created_at")
