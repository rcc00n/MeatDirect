import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";

import CheckoutForm, { type CheckoutSubmitValues } from "../components/checkout/CheckoutForm";
import { type OrderPayload } from "../api/orders";
import { createCheckout, fetchStripeConfig } from "../api/payments";
import { useCart } from "../context/CartContext";

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
        setError(result.error.message || "Payment failed. Please try again.");
      } else if (result.paymentIntent?.status === "succeeded") {
        clear();
        navigate("/success", { state: { orderId: order_id } });
      } else {
        setError("Payment did not complete. Please try again.");
      }
    } catch (apiError) {
      console.error("Failed to submit order / payment", apiError);
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Unable to submit order right now. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
      {error && <div className="checkout-alert checkout-alert--error">{error}</div>}
      {submitting && <div className="checkout-alert checkout-alert--info">Processing payment...</div>}
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
    return renderLayout(<div className="checkout-alert checkout-alert--error">{stripeError}</div>);
  }

  if (loadingStripe || !stripePromise) {
    return renderLayout(
      <div className="checkout-alert checkout-alert--info">Preparing a secure payment form...</div>,
    );
  }

  return renderLayout(
    <Elements stripe={stripePromise}>
      <CheckoutPageInner />
    </Elements>,
  );
}

export default CheckoutPage;
