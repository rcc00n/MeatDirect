from django.contrib.auth.signals import user_logged_in
from django.core.exceptions import DisallowedHost
from django.dispatch import receiver

from .models import StaffLoginEvent
from .utils import build_request_headers, extract_location, get_client_ip, infer_source, parse_user_agent


@receiver(user_logged_in, dispatch_uid="security.record_staff_login")
def record_staff_login(sender, request, user, **kwargs):
    if request is None or not getattr(user, "is_staff", False):
        return

    ip_address, forwarded_for = get_client_ip(request)
    user_agent = (request.META.get("HTTP_USER_AGENT") or "").strip()
    device_type, browser, operating_system = parse_user_agent(user_agent)

    try:
        host = request.get_host() if hasattr(request, "get_host") else request.META.get("HTTP_HOST", "")
    except (DisallowedHost, KeyError):
        host = request.META.get("HTTP_HOST", "")

    StaffLoginEvent.objects.create(
        user=user,
        username=user.get_username(),
        email=(getattr(user, "email", "") or "").strip(),
        source=infer_source(request.path),
        login_path=request.path[:255],
        host=host[:255],
        ip_address=ip_address or None,
        forwarded_for=forwarded_for,
        location=extract_location(request)[:255],
        user_agent=user_agent,
        device_type=device_type,
        browser=browser[:64],
        operating_system=operating_system[:64],
        accept_language=(request.META.get("HTTP_ACCEPT_LANGUAGE") or "").strip()[:255],
        referer=(request.META.get("HTTP_REFERER") or "").strip(),
        request_headers=build_request_headers(request),
    )
