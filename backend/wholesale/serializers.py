from rest_framework import serializers

from .models import WholesaleAccessRequest


class WholesaleAccessRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = WholesaleAccessRequest
        fields = ["id", "name", "email", "phone", "company", "message", "status", "created_at"]
        read_only_fields = ["status", "created_at"]


class WholesaleAccessVerifySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=128, trim_whitespace=True)
