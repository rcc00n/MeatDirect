import os
from unittest import mock

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from orders.models import Order
from products.models import Product


class StripeConfigTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_config_returns_503_when_no_publishable_key(self):
        with mock.patch.dict(
            os.environ,
            {
                "STRIPE_PUBLISHABLE_KEY": "",
                "VITE_STRIPE_PUBLISHABLE_KEY": "",
            },
            clear=False,
        ):
            response = self.client.get(reverse("stripe-config"))

        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.json()["detail"],
            "Stripe publishable key is not configured.",
        )

    def test_config_reports_livemode_for_live_key(self):
        with mock.patch.dict(
            os.environ,
            {"STRIPE_PUBLISHABLE_KEY": "pk_live_123"},
            clear=False,
        ):
            response = self.client.get(reverse("stripe-config"))

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["publishable_key"], "pk_live_123")
        self.assertTrue(payload["livemode"])

    def test_config_falls_back_to_vite_key(self):
        with mock.patch.dict(
            os.environ,
            {
                "STRIPE_PUBLISHABLE_KEY": "",
                "VITE_STRIPE_PUBLISHABLE_KEY": "pk_test_from_vite",
            },
            clear=False,
        ):
            response = self.client.get(reverse("stripe-config"))

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["publishable_key"], "pk_test_from_vite")
        self.assertFalse(payload["livemode"])


class CreateCheckoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.product = Product.objects.create(
            name="Test Steak",
            slug="test-steak",
            description="",
            price_cents=1000,
            main_image_url="",
            category="",
        )

    def test_create_checkout_requires_items(self):
        response = self.client.post(
            reverse("checkout"),
            {},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Items are required.")

    def test_create_checkout_rejects_invalid_product_id(self):
        response = self.client.post(
            reverse("checkout"),
            {"items": [{"product_id": "bad-id", "quantity": 1}]},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid product_id", response.json()["detail"])

    def test_create_checkout_rejects_non_object_item(self):
        response = self.client.post(
            reverse("checkout"),
            {"items": ["not-an-object"]},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Item 1 is invalid.")

    def test_create_checkout_rejects_non_positive_quantity(self):
        response = self.client.post(
            reverse("checkout"),
            {"items": [{"product_id": self.product.id, "quantity": 0}]},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Quantity must be at least 1.")

    def test_create_checkout_rejects_non_numeric_quantity(self):
        response = self.client.post(
            reverse("checkout"),
            {"items": [{"product_id": self.product.id, "quantity": "abc"}]},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid quantity", response.json()["detail"])

    def test_create_checkout_rejects_missing_product(self):
        response = self.client.post(
            reverse("checkout"),
            {"items": [{"product_id": 999999, "quantity": 1}]},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Products not found", response.json()["detail"])

    def test_create_checkout_rejects_invalid_order_type(self):
        response = self.client.post(
            reverse("checkout"),
            {
                "items": [{"product_id": self.product.id, "quantity": 1}],
                "order_type": "drone",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Invalid order type.")

    def test_create_checkout_delivery_requires_address_fields(self):
        response = self.client.post(
            reverse("checkout"),
            {
                "items": [{"product_id": self.product.id, "quantity": 1}],
                "order_type": "delivery",
                "address": {"line1": "123 Main St"},
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Delivery requires", response.json()["detail"])

    @mock.patch("payments.stripe_api.stripe.PaymentIntent.create")
    def test_create_checkout_creates_intent_and_order(self, mock_intent_create):
        mock_intent_create.return_value = {
            "id": "pi_test_123",
            "client_secret": "pi_test_123_secret_456",
        }
        payload = {
            "items": [{"product_id": self.product.id, "quantity": 2}],
            "full_name": "John Buyer",
            "email": "john@example.com",
            "phone": "5555551234",
            "order_type": "pickup",
        }

        response = self.client.post(reverse("checkout"), payload, format="json")

        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertEqual(body["client_secret"], "pi_test_123_secret_456")
        self.assertEqual(body["amount"], 2100)

        order = Order.objects.get(id=body["order_id"])
        self.assertEqual(order.total_cents, 2100)
        self.assertEqual(order.subtotal_cents, 2000)
        self.assertEqual(order.tax_cents, 100)
        self.assertEqual(order.stripe_payment_intent_id, "pi_test_123")

        mock_intent_create.assert_called_once_with(
            amount=2100,
            currency="cad",
            automatic_payment_methods={"enabled": True},
            receipt_email="john@example.com",
            metadata={"order_id": str(order.id)},
        )

    @mock.patch("payments.stripe_api.stripe.PaymentIntent.create")
    def test_create_checkout_returns_502_when_stripe_fails(self, mock_intent_create):
        mock_intent_create.side_effect = RuntimeError("stripe unavailable")
        payload = {
            "items": [{"product_id": self.product.id, "quantity": 1}],
            "full_name": "John Buyer",
            "email": "john@example.com",
            "phone": "5555551234",
            "order_type": "pickup",
        }

        response = self.client.post(reverse("checkout"), payload, format="json")

        self.assertEqual(response.status_code, 502)
        body = response.json()
        self.assertEqual(body["detail"], "Unable to create payment intent.")
        self.assertIn("stripe unavailable", body["error"])
