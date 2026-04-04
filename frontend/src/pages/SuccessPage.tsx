import { useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";

interface SuccessLocationState {
  orderId?: number;
  orderTotalCents?: number;
  currency?: string;
}

function SuccessPage() {
  const location = useLocation();
  const state = (location.state || {}) as SuccessLocationState;
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (hasTrackedRef.current) return;
    if (typeof window === "undefined" || typeof window.fbq !== "function") {
      return;
    }

    const hasOrderContext =
      typeof state.orderId === "number" || typeof state.orderTotalCents === "number";
    if (!hasOrderContext) {
      return;
    }

    const currency = state.currency ?? "USD";

    if (typeof state.orderTotalCents === "number") {
      const value = Number((state.orderTotalCents / 100).toFixed(2));
      window.fbq("track", "Purchase", { value, currency });
    } else {
      window.fbq("track", "Purchase");
    }

    hasTrackedRef.current = true;
  }, [state.currency, state.orderId, state.orderTotalCents]);

  return (
    <div className="checkout-status-page checkout-status-page--standalone">
      <div className="checkout-status-card checkout-status-card--success">
        <div className="checkout-status-card__crest" aria-hidden="true" />
        <p className="checkout-status-card__eyebrow">Payment success</p>
        <h1 className="checkout-status-card__title">Payment received</h1>

        <div className="checkout-status-card__metrics">
          {state.orderId && (
            <div className="checkout-status-card__metric">
              <span className="checkout-status-card__metric-label">Order</span>
              <strong className="checkout-status-card__metric-value">#{state.orderId}</strong>
            </div>
          )}
          {typeof state.orderTotalCents === "number" && (
            <div className="checkout-status-card__metric">
              <span className="checkout-status-card__metric-label">Amount</span>
              <strong className="checkout-status-card__metric-value">
                {(state.currency ?? "CAD")} {(state.orderTotalCents / 100).toFixed(2)}
              </strong>
            </div>
          )}
        </div>

        {state.orderId && (
          <p className="checkout-status-card__body">
            Your payment was completed successfully for order <strong>#{state.orderId}</strong>.
          </p>
        )}

        <p className="checkout-status-card__body checkout-status-card__body--muted">
          Thank you for your order. We&apos;ll start preparing it right away.
        </p>
        <p className="checkout-status-card__body checkout-status-card__body--muted">
          We&apos;ll email your pickup or delivery details as soon as the order processing steps finish.
        </p>
        <p className="checkout-status-card__body">
          Delivery heads-up: orders before 12 PM arrive the same day between 4–5 PM. After noon, expect delivery by 1
          PM tomorrow. You can reply to your confirmation email with any gate codes or extra notes.
        </p>

        <p className="checkout-status-card__body">
          For pickup orders, please bring your confirmation email and a photo ID to the store.
        </p>

        <div className="checkout-status-card__actions">
          <Link to="/" className="checkout-status-card__button">
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;
