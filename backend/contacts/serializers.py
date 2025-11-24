from rest_framework import serializers

from .models import ContactMessage, QuoteRequest


class QuoteRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteRequest
        fields = ["id", "name", "phone", "email", "address", "fulfillment", "message", "created_at"]


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "phone", "message", "created_at"]
