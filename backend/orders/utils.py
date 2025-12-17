from dataclasses import dataclass
from typing import Any, Dict, Iterable, Optional

from django.utils import timezone


SERVICE_AREAS = [
    {
        "key": "st_albert",
        "label": "St. Albert",
        "fee_cents": 2000,
        "city_keywords": ["st albert", "st. albert", "saint albert"],
        "postal_prefixes": ["T8N", "T8T"],
    },
    {
        "key": "sherwood_park",
        "label": "Sherwood Park",
        "fee_cents": 2500,
        "city_keywords": ["sherwood park", "sherwood"],
        "postal_prefixes": ["T8A", "T8B", "T8H"],
    },
    {
        "key": "spruce_grove",
        "label": "Spruce Grove",
        "fee_cents": 3500,
        "city_keywords": ["spruce grove"],
        "postal_prefixes": ["T7X"],
    },
    {
        "key": "leduc",
        "label": "Leduc",
        "fee_cents": 3500,
        "city_keywords": ["leduc"],
        "postal_prefixes": ["T9E"],
    },
]


class DeliveryZoneError(ValueError):
    """Raised when an address is outside the supported delivery areas."""


@dataclass
class DeliveryQuote:
    service_area: str
    fee_cents: int
    eta_text: str


def _normalize_text(value: Optional[str]) -> str:
    text = (value or "").lower()
    for ch in [".", ","]:
        text = text.replace(ch, " ")
    return " ".join(text.split())


def _normalize_postal_code(value: Optional[str]) -> str:
    return (value or "").replace(" ", "").upper()


def _matches_any(text: str, needles: Iterable[str]) -> bool:
    return any(needle in text for needle in needles if needle)


def _area_matches_address(area: Dict[str, Any], city: str, postal_code: str, address_line1: str) -> bool:
    normalized_city = _normalize_text(city)
    normalized_address = _normalize_text(address_line1)
    normalized_postal = _normalize_postal_code(postal_code)

    city_keywords: Iterable[str] = area.get("city_keywords", [])
    postal_prefixes = [
        _normalize_postal_code(prefix) for prefix in area.get("postal_prefixes", [])
    ]

    if _matches_any(normalized_city, city_keywords):
        return True
    if _matches_any(normalized_address, city_keywords):
        return True
    if normalized_postal and any(normalized_postal.startswith(prefix) for prefix in postal_prefixes):
        return True

    return False


def describe_supported_areas() -> str:
    parts = []
    for area in SERVICE_AREAS:
        dollars = area["fee_cents"] / 100
        parts.append(f"{area['label']} (${dollars:.0f})")
    return ", ".join(parts)


def determine_delivery_eta(now=None) -> str:
    """
    Human-friendly delivery window:
    - Orders before noon: same day between 4–5 PM.
    - Orders after noon: next day by 1 PM.
    """
    current = timezone.localtime(now or timezone.now())
    if current.hour < 12:
        return "Arrives today between 4–5 PM"
    return "Arrives by 1 PM tomorrow"


def get_delivery_quote(address_line1: str, city: str, postal_code: str, now=None) -> DeliveryQuote:
    for area in SERVICE_AREAS:
        if _area_matches_address(area, city, postal_code, address_line1):
            return DeliveryQuote(
                service_area=area["label"],
                fee_cents=area["fee_cents"],
                eta_text=determine_delivery_eta(now=now),
            )

    raise DeliveryZoneError(
        "Delivery is available to: "
        f"{describe_supported_areas()}. Please adjust your city/postal code."
    )


def calculate_tax_cents(subtotal_cents: int, delivery_fee_cents: int = 0) -> int:
    taxable = subtotal_cents + delivery_fee_cents
    return int(round(taxable * 0.05))
