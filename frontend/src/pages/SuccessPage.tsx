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
    <div style={{ maxWidth: 600, margin: "40px auto", textAlign: "center" }}>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Payment success 🎉</h1>

      {state.orderId && (
        <p style={{ fontSize: 16, marginBottom: 8 }}>
          Your order ID: <strong>#{state.orderId}</strong>
        </p>
      )}

      <p style={{ marginBottom: 8, color: "#475569" }}>
        Thank you for your order. We&apos;ll start preparing it right away.
      </p>
      <p style={{ marginBottom: 16, color: "#475569" }}>
        You&apos;ll receive an email with pickup or delivery details shortly.
      </p>
      <p style={{ marginBottom: 16, color: "#0f172a" }}>
        Delivery heads-up: orders before 12 PM arrive the same day between 4–5 PM. After noon, expect delivery by 1 PM
        tomorrow. You can reply to your confirmation email with any gate codes or extra notes.
      </p>

      <p style={{ marginBottom: 24, color: "#0f172a" }}>
        For pickup orders, please bring your confirmation email and a photo ID to the store.
      </p>

      <Link
        to="/"
        style={{
          display: "inline-block",
          padding: "10px 18px",
          borderRadius: 999,
          border: "1px solid #16a34a",
          color: "#16a34a",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Back to store
      </Link>
    </div>
  );
}

export default SuccessPage;
