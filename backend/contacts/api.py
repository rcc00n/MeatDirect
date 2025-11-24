import logging
import os

from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ContactMessageSerializer, QuoteRequestSerializer

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


class ContactMessageView(APIView):
    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()

        self.notify_team(message)
        logger.info(
            "Contact message received",
            extra={"contact_id": message.id, "email": message.email, "phone": message.phone},
        )

        return Response({"status": "received", "id": message.id}, status=status.HTTP_201_CREATED)

    def notify_team(self, message):
        recipient = os.environ.get("CONTACT_NOTIFICATION_EMAIL", "hello@meatdirect.com")
        subject = f"New contact message from {message.name}"
        body = "\n".join(
            [
                f"Name: {message.name}",
                f"Email: {message.email}",
                f"Phone: {message.phone or 'Not provided'}",
                "",
                "Message:",
                message.message,
            ]
        )
        try:
            send_mail(subject, body, None, [recipient], fail_silently=False)
        except Exception as exc:  # pragma: no cover - fail-safe for email transport
            logger.warning("Failed to send contact notification email", exc_info=exc, extra={"contact_id": message.id})
