import logging
import os
from datetime import datetime, timedelta

from django.conf import settings
from django.core import signing
from django.core.mail import send_mail
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import WholesaleAccessKey, WholesaleAccessRequest
from .serializers import WholesaleAccessRequestSerializer, WholesaleAccessVerifySerializer

logger = logging.getLogger(__name__)

SIGNING_SALT = "wholesale-access"
ACCESS_COOKIE_NAME = getattr(settings, "WHOLESALE_ACCESS_COOKIE_NAME", "wholesale_access")
ACCESS_TOKEN_LIFETIME_DAYS = int(getattr(settings, "WHOLESALE_ACCESS_TOKEN_DAYS", 14))
ACCESS_TOKEN_LIFETIME = timedelta(days=ACCESS_TOKEN_LIFETIME_DAYS)
WHOLESALE_CATALOG = [
    {
        "name": "Prime Ribeye, 0x1",
        "price": "$13.80/lb",
        "pack": "12 x 12oz trays",
        "note": "Hand-trimmed, ready for service",
    },
    {"name": "Packer Brisket", "price": "$4.90/lb", "pack": "~60lb case", "note": "USDA Choice & Prime on rotation"},
    {"name": "Airline Chicken Breast", "price": "$4.15/lb", "pack": "2 x 10lb bags", "note": "Skin-on, frenched wing"},
    {"name": "Atlantic Salmon Sides", "price": "$8.20/lb", "pack": "6-7lb average", "note": "Pin-boned, trimmed tail"},
    {"name": "Smoked Kielbasa", "price": "$5.40/lb", "pack": "15lb case", "note": "House recipe, natural casing"},
    {"name": "Wagyu Burgers, 6oz", "price": "$3.65/patty", "pack": "40 patties", "note": "80/20 blend, parchment stacked"},
]


class AccessSessionError(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_401_UNAUTHORIZED):
        super().__init__(message)
        self.status_code = status_code


def validate_session_token(token: str) -> tuple[WholesaleAccessKey, datetime]:
    try:
        payload = signing.loads(token, salt=SIGNING_SALT, max_age=int(ACCESS_TOKEN_LIFETIME.total_seconds()))
    except signing.SignatureExpired as exc:
        raise AccessSessionError("Session expired.") from exc
    except signing.BadSignature as exc:
        raise AccessSessionError("Invalid session.") from exc

    key_id = payload.get("key_id")
    exp_raw = payload.get("exp")
    if not key_id or not exp_raw:
        raise AccessSessionError("Invalid session.")

    try:
        exp = datetime.fromisoformat(exp_raw)
    except ValueError as exc:
        raise AccessSessionError("Invalid session.") from exc

    if exp.tzinfo is None:
        exp = timezone.make_aware(exp, timezone.utc)

    now = timezone.now()
    if exp <= now:
        raise AccessSessionError("Session expired.")

    key = WholesaleAccessKey.objects.filter(id=key_id, is_active=True).first()
    if not key or (key.expires_at and key.expires_at <= now):
        raise AccessSessionError("Session expired.")

    return key, exp


class WholesaleRequestView(APIView):
    def post(self, request):
        serializer = WholesaleAccessRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        access_request = serializer.save()

        self.notify_team(access_request)
        logger.info("Wholesale access request received", extra={"request_id": access_request.id, "email": access_request.email})

        return Response({"status": "received", "id": access_request.id}, status=status.HTTP_201_CREATED)

    def notify_team(self, access_request: WholesaleAccessRequest) -> None:
        recipient = os.environ.get("WHOLESALE_NOTIFICATION_EMAIL", "hello@meatdirect.com")
        subject = f"Wholesale access request from {access_request.name}"
        body = "\n".join(
            [
                f"Name: {access_request.name}",
                f"Email: {access_request.email}",
                f"Phone: {access_request.phone or 'N/A'}",
                f"Company: {access_request.company or 'N/A'}",
                "",
                "Message:",
                access_request.message or "(no message provided)",
            ]
        )
        try:
            send_mail(subject, body, None, [recipient], fail_silently=False)
        except Exception as exc:  # pragma: no cover - fail-safe for email transport
            logger.warning(
                "Failed to send wholesale request notification",
                exc_info=exc,
                extra={"request_id": access_request.id},
            )


class WholesaleAccessVerifyView(APIView):
    def post(self, request):
        serializer = WholesaleAccessVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data["code"]

        now = timezone.now()
        candidates = WholesaleAccessKey.objects.filter(
            is_active=True,
        ).filter(Q(expires_at__isnull=True) | Q(expires_at__gt=now))

        matched_key = None
        for key in candidates:
            if key.check_code(code):
                matched_key = key
                break

        if not matched_key:
            logger.info("Invalid wholesale code attempted")
            return Response({"detail": "Invalid or expired code."}, status=status.HTTP_400_BAD_REQUEST)

        expiry = matched_key.token_expiry(ACCESS_TOKEN_LIFETIME)
        max_age = int((expiry - now).total_seconds())
        if max_age <= 0:
            return Response({"detail": "Invalid or expired code."}, status=status.HTTP_400_BAD_REQUEST)

        token_payload = {"key_id": matched_key.id, "exp": expiry.isoformat()}
        token = signing.dumps(token_payload, salt=SIGNING_SALT)

        matched_key.record_use()

        response = Response(
            {
                "status": "ok",
                "expires_at": expiry.isoformat(),
                "key_label": matched_key.label,
            }
        )
        response.set_cookie(
            ACCESS_COOKIE_NAME,
            token,
            max_age=max_age,
            secure=settings.SESSION_COOKIE_SECURE,
            httponly=True,
            samesite=settings.SESSION_COOKIE_SAMESITE,
        )
        return response


class WholesaleAccessSessionView(APIView):
    def get(self, request):
        token = request.COOKIES.get(ACCESS_COOKIE_NAME)
        if not token:
            return Response({"active": False}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            key, exp = validate_session_token(token)
        except AccessSessionError as exc:
            return Response({"active": False, "detail": str(exc)}, status=exc.status_code)

        return Response({"active": True, "expires_at": exp.isoformat(), "key_label": key.label})


class WholesaleCatalogView(APIView):
    def get(self, request):
        token = request.COOKIES.get(ACCESS_COOKIE_NAME)
        if not token:
            return Response({"detail": "Access code required."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            _, exp = validate_session_token(token)
        except AccessSessionError as exc:
            return Response({"detail": str(exc)}, status=exc.status_code)

        return Response({"items": WHOLESALE_CATALOG, "expires_at": exp.isoformat()})
