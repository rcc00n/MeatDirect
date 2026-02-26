from unittest import mock

from django.core import mail
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from notifications.models import EmailNotification
from orders.models import Order, OrderItem
from payments.models import Payment
from products.models import Product


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="no-reply@example.com",
)
class StripeWebhookReceiptEmailTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.product = Product.objects.create(
            name="Sirloin",
            slug="sirloin-steak",
            description="",
            price_cents=2500,
            main_image_url="",
            category="",
        )
        self.order = Order.objects.create(
            full_name="Jane Doe",
            email="jane@example.com",
            phone="5551234567",
            address_line1="1 Webhook Way",
            address_line2="",
            city="Webhook City",
            postal_code="99999",
            order_type=Order.OrderType.DELIVERY,
            subtotal_cents=2500,
            tax_cents=250,
            total_cents=2750,
            delivery_notes="Ring bell",
        )
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            product_name=self.product.name,
            quantity=1,
            unit_price_cents=self.product.price_cents,
            total_cents=self.product.price_cents,
        )

    @mock.patch("payments.webhooks.sync_products_from_square")
    @mock.patch("payments.webhooks.decrement_square_inventory_for_order")
    @mock.patch("payments.webhooks.STRIPE_WEBHOOK_SECRET", new="")
    def test_payment_intent_succeeded_records_payment_and_sends_receipt(
        self, mock_decrement, mock_sync
    ):
        payload = {
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_test_123",
                    "amount": self.order.total_cents,
                    "currency": "cad",
                    "status": "succeeded",
                    "metadata": {"order_id": str(self.order.id)},
                }
            },
        }

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                reverse("stripe-webhook"), payload, format="json"
            )

        self.assertEqual(response.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PROCESSING)
        self.assertEqual(
            self.order.stripe_payment_intent_id, payload["data"]["object"]["id"]
        )

        payment = Payment.objects.get(
            stripe_payment_intent_id=payload["data"]["object"]["id"]
        )
        self.assertEqual(payment.order_id, self.order.id)
        self.assertEqual(payment.amount_cents, payload["data"]["object"]["amount"])
        self.assertEqual(payment.currency, payload["data"]["object"]["currency"])
        self.assertEqual(payment.status, payload["data"]["object"]["status"])

        receipt_notifications = EmailNotification.objects.filter(
            order=self.order, kind="order_receipt"
        )
        self.assertEqual(receipt_notifications.count(), 1)
        self.assertEqual(receipt_notifications.first().status, "sent")

        status_notifications = EmailNotification.objects.filter(
            order=self.order, kind="order_status_update"
        )
        self.assertEqual(status_notifications.count(), 1)
        self.assertEqual(status_notifications.first().status, "sent")

        self.assertEqual(len(mail.outbox), 2)

        receipt_message = mail.outbox[0]
        self.assertEqual(receipt_message.to, [self.order.email])
        self.assertTrue(receipt_message.attachments)
        filename, content, mimetype = receipt_message.attachments[0]
        self.assertEqual(filename, "order_receipt.pdf")
        self.assertEqual(mimetype, "application/pdf")
        self.assertTrue(content)

    @mock.patch("payments.webhooks.STRIPE_WEBHOOK_SECRET", new="")
    def test_webhook_ignores_event_without_order_id_metadata(self):
        payload = {
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_missing_metadata",
                    "amount": self.order.total_cents,
                    "currency": "cad",
                    "status": "succeeded",
                    "metadata": {},
                }
            },
        }

        response = self.client.post(reverse("stripe-webhook"), payload, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["detail"], "No order_id in metadata")
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PLACED)
        self.assertEqual(self.order.stripe_payment_intent_id, "")
        self.assertEqual(Payment.objects.count(), 0)

    @mock.patch("payments.webhooks.STRIPE_WEBHOOK_SECRET", new="")
    def test_webhook_with_unknown_order_id_is_noop(self):
        payload = {
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_unknown_order",
                    "amount": 1000,
                    "currency": "cad",
                    "status": "succeeded",
                    "metadata": {"order_id": "999999"},
                }
            },
        }

        response = self.client.post(reverse("stripe-webhook"), payload, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["received"], True)
        self.assertEqual(Payment.objects.count(), 0)

    @mock.patch("payments.webhooks.STRIPE_WEBHOOK_SECRET", new="whsec_test_secret")
    @mock.patch("payments.webhooks.stripe.Webhook.construct_event")
    def test_webhook_returns_400_on_invalid_signature(self, mock_construct_event):
        mock_construct_event.side_effect = ValueError("bad payload")

        response = self.client.post(
            reverse("stripe-webhook"),
            {"type": "payment_intent.succeeded"},
            format="json",
            HTTP_STRIPE_SIGNATURE="t=123,v1=invalid",
        )

        self.assertEqual(response.status_code, 400)

    @mock.patch("payments.webhooks.STRIPE_WEBHOOK_SECRET", new="")
    def test_webhook_ignores_non_success_payment_events(self):
        payload = {
            "type": "payment_intent.payment_failed",
            "data": {
                "object": {
                    "id": "pi_failed_1",
                    "amount": self.order.total_cents,
                    "currency": "cad",
                    "status": "requires_payment_method",
                    "metadata": {"order_id": str(self.order.id)},
                }
            },
        }

        response = self.client.post(reverse("stripe-webhook"), payload, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["received"], True)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PLACED)
