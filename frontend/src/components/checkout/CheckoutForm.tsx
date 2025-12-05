import { useState, type FormEvent } from "react";
import { CardElement } from "@stripe/react-stripe-js";

import type { OrderType } from "../../api/orders";

export interface CheckoutFormValues {
  order_type: OrderType;
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
  notes: string;
  pickup_location: string;
  pickup_instructions: string;
}

interface CheckoutFormProps {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  submitting?: boolean;
  onSubmit: (values: CheckoutFormValues) => void | Promise<void>;
}

function CheckoutForm({ subtotalCents, taxCents, totalCents, submitting = false, onSubmit }: CheckoutFormProps) {
  const [values, setValues] = useState<CheckoutFormValues>({
    order_type: "pickup",
    full_name: "",
    email: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
    notes: "",
    pickup_location: "",
    pickup_instructions: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (key: keyof CheckoutFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (values.order_type === "delivery" && (!values.address_line1 || !values.city || !values.postal_code)) {
    setFormError("Delivery requires address, city, and postal code.");
    return;
  }
  setFormError(null);
  onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="checkout-card">
        <div className="checkout-card__header">
          <div className="checkout-card__title">Fulfillment</div>
          <p className="checkout-card__muted">Choose pickup or delivery</p>
        </div>
        <div className="checkout-choice-group">
          {(["pickup", "delivery"] as OrderType[]).map((type) => {
            const isActive = values.order_type === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleChange("order_type", type)}
                className={`checkout-choice ${isActive ? "is-active" : ""}`}
              >
                <div className="checkout-choice__title">{type === "pickup" ? "Pickup" : "Delivery"}</div>
                <div className="checkout-choice__muted">
                  {type === "pickup" ? "Grab in-store or curbside." : "Delivered to your address."}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="checkout-card">
        <div className="checkout-card__header">
          <div className="checkout-card__title">Contact</div>
          <p className="checkout-card__muted">We’ll text or email updates about your order.</p>
        </div>
        <div className="checkout-row">
          <label className="checkout-label">
            Full name
            <input
              required
              type="text"
              value={values.full_name}
              onChange={(event) => handleChange("full_name", event.target.value)}
              className="checkout-input"
            />
          </label>

          <div className="checkout-row checkout-row--split">
            <label className="checkout-label">
              Email
              <input
                required
                type="email"
                value={values.email}
                onChange={(event) => handleChange("email", event.target.value)}
                className="checkout-input"
              />
            </label>
            <label className="checkout-label">
              Phone
              <input
                required
                type="tel"
                value={values.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                className="checkout-input"
              />
            </label>
          </div>
        </div>
      </div>

      {values.order_type === "delivery" ? (
        <div className="checkout-card">
          <div className="checkout-card__header">
            <div className="checkout-card__title">Delivery address</div>
            <p className="checkout-card__muted">Enter where we should deliver.</p>
          </div>
          <div className="checkout-row">
            <label className="checkout-label">
              Address line 1
              <input
                required
                type="text"
                value={values.address_line1}
                onChange={(event) => handleChange("address_line1", event.target.value)}
                className="checkout-input"
              />
            </label>
            <label className="checkout-label">
              Address line 2
              <input
                type="text"
                value={values.address_line2}
                onChange={(event) => handleChange("address_line2", event.target.value)}
                className="checkout-input"
                placeholder="Apartment, suite, etc."
              />
            </label>
            <div className="checkout-row checkout-row--split">
              <label className="checkout-label">
                City
                <input
                  required
                  type="text"
                  value={values.city}
                  onChange={(event) => handleChange("city", event.target.value)}
                  className="checkout-input"
                />
              </label>
              <label className="checkout-label">
                Postal code
                <input
                  required
                  type="text"
                  value={values.postal_code}
                  onChange={(event) => handleChange("postal_code", event.target.value)}
                  className="checkout-input"
                />
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="checkout-card">
          <div className="checkout-card__header">
            <div className="checkout-card__title">Pickup details</div>
            <p className="checkout-card__muted">Tell us how you’d like to pick up.</p>
          </div>
          <div className="checkout-row">
            <label className="checkout-label">
              Pickup location
              <input
                type="text"
                value={values.pickup_location}
                onChange={(event) => handleChange("pickup_location", event.target.value)}
                className="checkout-input"
                placeholder="Storefront or curbside"
              />
            </label>
            <label className="checkout-label">
              Pickup instructions
              <textarea
                value={values.pickup_instructions}
                onChange={(event) => handleChange("pickup_instructions", event.target.value)}
                rows={3}
                className="checkout-textarea"
                placeholder="Vehicle description, arrival window..."
              />
            </label>
          </div>
        </div>
      )}

      <div className="checkout-card">
        <div className="checkout-card__title">Notes</div>
        <textarea
          value={values.notes}
          onChange={(event) => handleChange("notes", event.target.value)}
          rows={3}
          placeholder="Delivery window, doneness preference..."
          className="checkout-textarea"
        />
      </div>

      <div className="checkout-card">
        <div className="checkout-card__title">Payment</div>
        <div className="checkout-payment">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: "16px",
                  color: "#0f172a",
                  "::placeholder": { color: "#94a3b8" },
                },
              },
            }}
          />
        </div>
        <p className="checkout-hint">
          For testing, use card <strong>4242 4242 4242 4242</strong> with any future expiry and any CVC.
        </p>
      </div>

      {formError && <div className="checkout-alert checkout-alert--error">{formError}</div>}

      <div className="checkout-summary">
        <div className="checkout-summary__meta">
          <div className="checkout-summary__muted">Due today</div>
          <div className="checkout-summary__row">
            <span>Subtotal</span>
            <span>${(subtotalCents / 100).toFixed(2)}</span>
          </div>
          <div className="checkout-summary__row">
            <span>GST (5%)</span>
            <span>${(taxCents / 100).toFixed(2)}</span>
          </div>
          <div className="checkout-summary__total">
            <span>Total</span>
            <strong>${(totalCents / 100).toFixed(2)}</strong>
          </div>
        </div>
        <button type="submit" disabled={submitting} className="checkout-submit">
          {submitting ? "Placing order..." : "Place order"}
        </button>
      </div>
    </form>
  );
}

export default CheckoutForm;
