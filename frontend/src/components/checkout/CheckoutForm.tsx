import { useState, type FormEvent } from "react";
import { CardElement } from "@stripe/react-stripe-js";

import type { OrderType } from "../../api/orders";
import {
  DELIVERY_AREAS,
  buildDeliveryQuote,
  calculateTaxCents,
  summarizeDeliveryAreas,
} from "../../utils/delivery";

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

export interface CheckoutSubmitValues extends CheckoutFormValues {
  delivery_fee_cents: number;
  delivery_service_area?: string;
  delivery_eta_text?: string;
  tax_cents: number;
  total_cents: number;
}

interface CheckoutFormProps {
  subtotalCents: number;
  submitting?: boolean;
  onSubmit: (values: CheckoutSubmitValues) => void | Promise<void>;
}

function CheckoutForm({ subtotalCents, submitting = false, onSubmit }: CheckoutFormProps) {
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

  const isDelivery = values.order_type === "delivery";
  const deliveryQuote = isDelivery
    ? buildDeliveryQuote(values.address_line1, values.city, values.postal_code)
    : null;
  const deliveryFeeCents = deliveryQuote?.feeCents ?? 0;
  const taxCents = calculateTaxCents(subtotalCents, deliveryFeeCents);
  const totalCents = subtotalCents + deliveryFeeCents + taxCents;
  const deliveryAreaSummary = summarizeDeliveryAreas();
  const deliveryZoneError =
    isDelivery && values.city && values.postal_code && !deliveryQuote
      ? `Delivery is available to ${deliveryAreaSummary}.`
      : null;

  const handleChange = (key: keyof CheckoutFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isDelivery && (!values.address_line1 || !values.city || !values.postal_code)) {
      setFormError("Delivery requires address, city, and postal code.");
      return;
    }

    if (isDelivery && !deliveryQuote) {
      setFormError(`We currently deliver to ${deliveryAreaSummary}. Please verify your city/postal code.`);
      return;
    }

    setFormError(null);
    onSubmit({
      ...values,
      delivery_fee_cents: deliveryFeeCents,
      delivery_service_area: deliveryQuote?.area.label,
      delivery_eta_text: deliveryQuote?.etaText,
      tax_cents: taxCents,
      total_cents: totalCents,
    });
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

      {isDelivery ? (
        <div className="checkout-card">
          <div className="checkout-card__header">
            <div className="checkout-card__title">Delivery address</div>
            <p className="checkout-card__muted">
              Enter where we should deliver. We&apos;ll auto-match your zone and fee from your city/postal code.
            </p>
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
          <div className="checkout-alert checkout-alert--muted">
            {deliveryQuote ? (
              <>
                Delivery zone: <strong>{deliveryQuote.area.label}</strong> (${(deliveryFeeCents / 100).toFixed(0)}) •{" "}
                <span>{deliveryQuote.etaText}</span>
              </>
            ) : (
              <>We deliver to {deliveryAreaSummary}. Please include your city and postal code to confirm.</>
            )}
          </div>
          {deliveryZoneError && <div className="checkout-alert checkout-alert--error">{deliveryZoneError}</div>}
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

      {isDelivery && (
        <div className="checkout-card">
          <div className="checkout-card__header">
            <div className="checkout-card__title">Delivery window & pricing</div>
            <p className="checkout-card__muted">
              Orders placed before 12:00 arrive the same day between 4–5 PM. After noon, they arrive by 1 PM the next day.
            </p>
          </div>
          <div className="delivery-zones">
            {DELIVERY_AREAS.map((area) => (
              <div key={area.key} className="delivery-zone">
                <div className="delivery-zone__label">{area.label}</div>
                <div className="delivery-zone__price">${(area.feeCents / 100).toFixed(0)}</div>
                <div className="delivery-zone__meta">
                  Auto-match by city name or postal: {area.postalPrefixes.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="checkout-card">
        <div className="checkout-card__title">{isDelivery ? "Delivery notes" : "Notes"}</div>
        <textarea
          value={values.notes}
          onChange={(event) => handleChange("notes", event.target.value)}
          rows={3}
          placeholder={
            isDelivery
              ? "Gate code, buzzer details, safe drop instructions..."
              : "Delivery window, doneness preference..."
          }
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
          <div className="checkout-summary__muted">
            {isDelivery
              ? deliveryQuote?.etaText || "Delivery ETA set once address is confirmed."
              : "Due today"}
          </div>
          <div className="checkout-summary__row">
            <span>Subtotal</span>
            <span>${(subtotalCents / 100).toFixed(2)}</span>
          </div>
          {isDelivery && (
            <div className="checkout-summary__row">
              <span>Delivery{deliveryQuote?.area.label ? ` (${deliveryQuote.area.label})` : ""}</span>
              <span>${(deliveryFeeCents / 100).toFixed(2)}</span>
            </div>
          )}
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
