import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";

import CheckoutForm, { type CheckoutSubmitValues } from "../components/checkout/CheckoutForm";
import { type OrderPayload } from "../api/orders";
import { createCheckout, fetchStripeConfig } from "../api/payments";
import { useCart } from "../context/CartContext";

function getReadablePaymentError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "We could not start your payment. No charge was completed. Please try again or contact support.";
  }

  const message = error.message.trim();

  if (!message) {
    return "We could not start your payment. No charge was completed. Please try again or contact support.";
  }

  if (message.includes("Unable to create payment intent")) {
    return "We could not start your payment on the server. No charge was completed. Please try again in a few minutes or contact support.";
  }

  return message;
}

function CheckoutPageInner() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { items, subtotalCents, clear } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: CheckoutSubmitValues) => {
    if (!items.length) return;

    if (!stripe || !elements) {
      setError("Payment is not ready yet. Please wait a moment and try again.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const order: OrderPayload = {
      items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
      full_name: values.full_name,
      email: values.email,
      phone: values.phone,
      order_type: values.order_type,
      subtotal_cents: subtotalCents,
      tax_cents: values.tax_cents,
      total_cents: values.total_cents,
      delivery_fee_cents: values.delivery_fee_cents,
      delivery_service_area: values.delivery_service_area,
      delivery_eta_text: values.delivery_eta_text,
      address:
        values.order_type === "delivery"
          ? {
              line1: values.address_line1,
              line2: values.address_line2,
              city: values.city,
              postal_code: values.postal_code,
              notes: values.notes,
            }
          : undefined,
      notes: values.notes,
      delivery_notes: values.order_type === "delivery" ? values.notes : undefined,
      pickup_location: values.order_type === "pickup" ? values.pickup_location : undefined,
      pickup_instructions: values.order_type === "pickup" ? values.pickup_instructions : undefined,
    };

    try {
      // 1) Create order + PaymentIntent on backend
      const { client_secret, order_id } = await createCheckout(order);

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError("Please enter your card details.");
        setSubmitting(false);
        return;
      }

      // 2) Confirm card payment with Stripe
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: values.full_name,
            email: values.email,
          },
        },
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Payment was not approved. No charge was completed. Please check your card details or try another card."
        );
      } else if (result.paymentIntent?.status === "succeeded") {
        clear();
        navigate("/success", {
          state: { orderId: order_id, orderTotalCents: order.total_cents, currency: "CAD" },
        });
      } else {
        setError(
          "Payment is not confirmed yet. No receipt will be issued until Stripe marks the payment as successful."
        );
      }
    } catch (apiError) {
      console.error("Failed to submit order / payment", apiError);
      setError(getReadablePaymentError(apiError));
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="checkout-status-page">
        <div className="checkout-status-card checkout-status-card--error">
          <p className="checkout-status-card__eyebrow">Payment error</p>
          <h2 className="checkout-status-card__title">Your payment was not completed</h2>
          <p className="checkout-status-card__body">{error}</p>
          <div className="checkout-status-card__actions">
            <button type="button" className="checkout-status-card__button" onClick={() => setError(null)}>
              Try again
            </button>
            <button
              type="button"
              className="checkout-status-card__button checkout-status-card__button--ghost"
              onClick={() => navigate("/cart")}
            >
              Back to cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-form-shell">
      {items.length === 0 ? (
        <div className="checkout-alert checkout-alert--muted">Cart is empty. Add items to proceed.</div>
      ) : (
        <CheckoutForm
          subtotalCents={subtotalCents}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
      {submitting && (
        <div className="checkout-alert checkout-alert--info">
          Authorizing your payment securely. Please do not close or refresh this page.
        </div>
      )}
    </div>
  );
}

function CheckoutPage() {
  const insecureHostFallback =
    import.meta.env.VITE_SECURE_CHECKOUT_ORIGIN?.trim() || "https://api.meatdirect.duckdns.org";
  const envStripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim();
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [loadingStripe, setLoadingStripe] = useState(true);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const renderStatusScreen = (title: string, message: string, tone: "default" | "error" = "default") => (
    <div className="checkout-status-page">
      <div className={`checkout-status-card${tone === "error" ? " checkout-status-card--error" : ""}`}>
        <p className="checkout-status-card__eyebrow">Secure checkout</p>
        <h2 className="checkout-status-card__title">{title}</h2>
        <p className="checkout-status-card__body">{message}</p>
      </div>
    </div>
  );
  const renderLayout = (content: ReactNode) => (
    <div className="checkout-page">
      <div className="checkout-shell">
        <div className="checkout-header">
          <p className="checkout-header__eyebrow">Secure checkout</p>
          <h1 className="checkout-header__title">Review & place your order</h1>
          <p className="checkout-header__muted">Finalize your details and pay securely.</p>
        </div>
        {content}
      </div>
    </div>
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hostname = window.location.hostname;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

    if (window.isSecureContext || isLocal) {
      return;
    }

    try {
      const cartSnapshot = localStorage.getItem("md_cart");
      const target = new URL(
        `${insecureHostFallback}${window.location.pathname}${window.location.search}${window.location.hash}`
      );
      if (cartSnapshot) {
        target.searchParams.set("cart", btoa(cartSnapshot));
      }
      setStripeError("Redirecting you to our secure checkout…");
      window.location.replace(target.toString());
    } catch (error) {
      console.error("Secure checkout redirect failed", error);
      setStripeError("Payments require a secure connection. Please switch to HTTPS and try again.");
    }
  }, [insecureHostFallback]);

  useEffect(() => {
    let cancelled = false;

    async function prepareStripe() {
      setLoadingStripe(true);
      try {
        const publishableKey =
          envStripeKey ||
          (await fetchStripeConfig()).publishable_key?.trim();

        if (!publishableKey) {
          throw new Error("Stripe publishable key is missing on the server.");
        }

        const promise = loadStripe(publishableKey);
        const stripeInstance = await promise;

        if (!stripeInstance) {
          throw new Error("Stripe failed to initialize with the provided key.");
        }

        if (!cancelled) {
          setStripePromise(promise);
          setStripeError(null);
        }
      } catch (error) {
        console.error("Failed to initialize Stripe", error);
        if (!cancelled) {
          setStripeError(
            "Payments are unavailable right now. Please try again soon or contact support."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingStripe(false);
        }
      }
    }

    prepareStripe();

    return () => {
      cancelled = true;
    };
  }, [envStripeKey]);

  if (stripeError) {
    return renderLayout(renderStatusScreen("We could not open checkout", stripeError, "error"));
  }

  if (loadingStripe || !stripePromise) {
    return renderLayout(renderStatusScreen("Preparing secure checkout", "Loading the payment form now."));
  }

  return renderLayout(
    <Elements stripe={stripePromise}>
      <CheckoutPageInner />
    </Elements>,
  );
}

export default CheckoutPage;
