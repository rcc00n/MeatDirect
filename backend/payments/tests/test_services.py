from django.test import TestCase

from orders.models import Order
from payments.models import Payment
from payments.services import record_stripe_payment_from_intent


class RecordStripePaymentFromIntentTests(TestCase):
    def setUp(self):
        self.order = Order.objects.create(
            full_name="Service Test",
            email="service@example.com",
            phone="5550000000",
            order_type=Order.OrderType.PICKUP,
            subtotal_cents=1000,
            tax_cents=50,
            total_cents=1050,
        )

    def test_creates_payment_when_not_existing(self):
        payment = record_stripe_payment_from_intent(
            self.order,
            {
                "id": "pi_service_1",
                "amount": 1050,
                "currency": "cad",
                "status": "succeeded",
            },
        )

        self.assertEqual(Payment.objects.count(), 1)
        self.assertEqual(payment.order_id, self.order.id)
        self.assertEqual(payment.stripe_payment_intent_id, "pi_service_1")
        self.assertEqual(payment.amount_cents, 1050)
        self.assertEqual(payment.currency, "cad")
        self.assertEqual(payment.status, "succeeded")
