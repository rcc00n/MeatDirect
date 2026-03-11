import ipaddress

from .models import StaffLoginEvent


TRACKED_HEADERS = (
    "HTTP_USER_AGENT",
    "HTTP_ACCEPT_LANGUAGE",
    "HTTP_REFERER",
    "HTTP_X_FORWARDED_FOR",
    "HTTP_X_REAL_IP",
    "HTTP_HOST",
    "HTTP_CF_IPCOUNTRY",
    "HTTP_X_COUNTRY",
    "HTTP_X_COUNTRY_CODE",
    "HTTP_X_REGION",
    "HTTP_X_CITY",
    "HTTP_GEOIP_COUNTRY_NAME",
    "HTTP_GEOIP_REGION_NAME",
    "HTTP_GEOIP_CITY",
)


def clean_ip(value: str) -> str:
    candidate = (value or "").strip()
    if not candidate:
        return ""
    if candidate.startswith("[") and "]" in candidate:
        candidate = candidate[1:candidate.index("]")]
    elif candidate.count(":") == 1 and "." in candidate:
        candidate = candidate.split(":", 1)[0]
    try:
        return str(ipaddress.ip_address(candidate))
    except ValueError:
        return ""


def get_client_ip(request) -> tuple[str, str]:
    forwarded_for = (request.META.get("HTTP_X_FORWARDED_FOR") or "").strip()
    if forwarded_for:
        for part in [item.strip() for item in forwarded_for.split(",")]:
            ip_address = clean_ip(part)
            if ip_address:
                return ip_address, forwarded_for

    for header in ("HTTP_X_REAL_IP", "REMOTE_ADDR"):
        ip_address = clean_ip(request.META.get(header, ""))
        if ip_address:
            return ip_address, forwarded_for
    return "", forwarded_for


def infer_source(login_path: str) -> str:
    if login_path.startswith("/admin/login"):
        return StaffLoginEvent.Source.ADMIN
    if login_path.startswith("/accounts/login"):
        return StaffLoginEvent.Source.SITE
    if login_path.startswith("/api/"):
        return StaffLoginEvent.Source.API
    return StaffLoginEvent.Source.OTHER


def parse_user_agent(user_agent: str) -> tuple[str, str, str]:
    raw = (user_agent or "").strip()
    normalized = raw.lower()

    if not normalized:
        return StaffLoginEvent.DeviceType.UNKNOWN, "", ""

    if any(token in normalized for token in ("bot", "spider", "crawler", "curl/", "wget/")):
        device_type = StaffLoginEvent.DeviceType.BOT
    elif "ipad" in normalized or "tablet" in normalized:
        device_type = StaffLoginEvent.DeviceType.TABLET
    elif any(token in normalized for token in ("iphone", "android", "mobile")):
        device_type = StaffLoginEvent.DeviceType.MOBILE
    else:
        device_type = StaffLoginEvent.DeviceType.DESKTOP

    browser_checks = (
        ("Edg/", "Edge"),
        ("OPR/", "Opera"),
        ("Chrome/", "Chrome"),
        ("Firefox/", "Firefox"),
        ("Version/", "Safari"),
    )
    browser = ""
    for token, label in browser_checks:
        if token.lower() in normalized:
            browser = label
            break

    if "windows nt" in normalized:
        operating_system = "Windows"
    elif "iphone" in normalized or "ipad" in normalized or "cpu os" in normalized:
        operating_system = "iOS"
    elif "android" in normalized:
        operating_system = "Android"
    elif "mac os x" in normalized or "macintosh" in normalized:
        operating_system = "macOS"
    elif "linux" in normalized:
        operating_system = "Linux"
    else:
        operating_system = ""

    return device_type, browser, operating_system


def extract_location(request) -> str:
    city = (
        request.META.get("HTTP_X_CITY")
        or request.META.get("HTTP_GEOIP_CITY")
        or ""
    ).strip()
    region = (
        request.META.get("HTTP_X_REGION")
        or request.META.get("HTTP_GEOIP_REGION_NAME")
        or ""
    ).strip()
    country = (
        request.META.get("HTTP_GEOIP_COUNTRY_NAME")
        or request.META.get("HTTP_X_COUNTRY")
        or request.META.get("HTTP_X_COUNTRY_CODE")
        or request.META.get("HTTP_CF_IPCOUNTRY")
        or ""
    ).strip()
    parts = [part for part in (city, region, country) if part]
    return ", ".join(parts)


def build_request_headers(request) -> dict[str, str]:
    data = {
        "path": request.path,
        "method": request.method,
    }
    for header in TRACKED_HEADERS:
        value = (request.META.get(header) or "").strip()
        if value:
            data[header] = value
    return data

