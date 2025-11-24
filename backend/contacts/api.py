import logging
import os

from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import QuoteRequestSerializer

logger = logging.getLogger(__name__)


class QuoteRequestView(APIView):
    def post(self, request):
        serializer = QuoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quote = serializer.save()

        self.notify_team(quote)
        logger.info(
            "Quote request logged",
            extra={"quote_id": quote.id, "email": quote.email, "phone": quote.phone, "fulfillment": quote.fulfillment},
        )

        return Response({"status": "received", "id": quote.id}, status=status.HTTP_201_CREATED)

    def notify_team(self, quote):
        recipient = os.environ.get("QUOTE_NOTIFICATION_EMAIL", "hello@meatdirect.com")
        subject = f"New quote request from {quote.name}"
        body = "\n".join(
            [
                f"Name: {quote.name}",
                f"Phone: {quote.phone}",
                f"Email: {quote.email}",
                f"Address: {quote.address}",
                f"Preferred pickup/delivery: {quote.fulfillment or 'Not specified'}",
                "",
                "Message:",
                quote.message or "(no message provided)",
            ]
        )
        try:
            send_mail(subject, body, None, [recipient], fail_silently=False)
        except Exception as exc:  # pragma: no cover - fail-safe for email transport
            logger.warning("Failed to send quote notification email", exc_info=exc, extra={"quote_id": quote.id})
