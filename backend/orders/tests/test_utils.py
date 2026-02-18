from datetime import datetime

from django.test import TestCase
from django.utils import timezone

from orders.utils import DeliveryZoneError, get_delivery_quote


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
