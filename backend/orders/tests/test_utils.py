from datetime import datetime

from django.test import TestCase
from django.utils import timezone

from orders.utils import (
    calculate_tax_cents,
    describe_supported_areas,
    DeliveryZoneError,
    determine_delivery_eta,
    estimate_delivery_date,
    get_delivery_quote,
)


class DeliveryQuoteTests(TestCase):
    def test_get_delivery_quote_matches_by_city_keyword(self):
        quote = get_delivery_quote(
            address_line1="123 Any St",
            city="St. Albert",
            postal_code="T5A1A1",
            now=timezone.make_aware(datetime(2026, 2, 1, 10, 0, 0)),
        )

        self.assertEqual(quote.service_area, "St. Albert")
        self.assertEqual(quote.fee_cents, 2000)
        self.assertIn("Arrives today", quote.eta_text)

    def test_get_delivery_quote_raises_outside_supported_areas(self):
        with self.assertRaises(DeliveryZoneError):
            get_delivery_quote(
                address_line1="500 Unknown Road",
                city="Calgary",
                postal_code="T2P1J9",
            )

    def test_get_delivery_quote_matches_by_postal_prefix(self):
        quote = get_delivery_quote(
            address_line1="88 Sample Ave",
            city="",
            postal_code="T8A 3C1",
            now=timezone.make_aware(datetime(2026, 2, 1, 9, 0, 0)),
        )

        self.assertEqual(quote.service_area, "Sherwood Park")
        self.assertEqual(quote.fee_cents, 2500)


class DeliveryEtaTests(TestCase):
    def test_determine_delivery_eta_before_noon(self):
        eta = determine_delivery_eta(
            now=timezone.make_aware(datetime(2026, 2, 1, 11, 59, 0))
        )
        self.assertEqual(eta, "Arrives today between 4–5 PM")

    def test_determine_delivery_eta_after_noon(self):
        eta = determine_delivery_eta(
            now=timezone.make_aware(datetime(2026, 2, 1, 12, 1, 0))
        )
        self.assertEqual(eta, "Arrives by 1 PM tomorrow")

    def test_estimate_delivery_date_after_noon_rolls_to_next_day(self):
        estimated_date = estimate_delivery_date(
            now=timezone.make_aware(datetime(2026, 2, 1, 12, 30, 0))
        )
        self.assertEqual(estimated_date.isoformat(), "2026-02-02")


class PricingHelperTests(TestCase):
    def test_calculate_tax_cents_includes_delivery_fee(self):
        self.assertEqual(calculate_tax_cents(4000, 2000), 300)

    def test_describe_supported_areas_contains_named_zones(self):
        areas = describe_supported_areas()
        self.assertIn("St. Albert", areas)
        self.assertIn("Sherwood Park", areas)
