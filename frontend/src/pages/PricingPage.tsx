import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { submitQuoteRequest } from "../api/contact";
import { getProducts } from "../api/products";
import type { Product } from "../types";

const summaryItems = [
  "Steaks (ribeye, striploin, sirloin, tenderloin medallions)",
  "Roasts (sirloin tip, cross rib, blade, round)",
  "Large cuts for smoking (brisket, back ribs, short ribs)",
  "Ground beef—lean blend for burgers, chili, and meal prep",
  "Optional: bones, organs, and fat if you want the whole animal value",
];

const steakCuts = ["Ribeye", "Striploin", "Sirloin", "Tenderloin medallions", "Flank / Skirt (by request)"];
const roastCuts = ["Sirloin tip roast", "Cross rib", "Blade roast", "Inside / Outside round", "Eye of round"];
const largeCuts = ["Full brisket (flat + point)", "Back ribs or short ribs", "Tri-tip or picanha", "Chuck roast"];
const groundNotes = [
  "Ground from trim plus lean muscle for consistent fat ratio.",
  "Great for burgers, tacos, chili, and kid-friendly meals.",
  "We can bag in 1 lb or 1.5 lb packs—tell us your meal size.",
];
const optionalItems = [
  "Marrow and soup bones for broth",
  "Beef fat for rendering tallow",
  "Organs (liver, heart, kidney) if you want everything included",
];

const weightBreakdown = [
  { label: "Steaks", amount: "45–55 lb", note: "Ribeye, striploin, sirloin, medallions" },
  { label: "Roasts", amount: "45–60 lb", note: "Blade, sirloin tip, rounds" },
  { label: "Ribs & Brisket", amount: "35–45 lb", note: "Full brisket, back ribs, short ribs" },
  { label: "Ground", amount: "120–140 lb", note: "Lean blend, bagged to your preference" },
  { label: "Bones & Trim", amount: "35–50 lb", note: "Soup bones, fat, organs if kept" },
];

type HighlightItem = {
  name: string;
  fallback: string;
  unit?: string;
};

type HighlightGroup = {
  title: string;
  tone: "amber" | "emerald" | "slate";
  description: string;
  items: HighlightItem[];
};

const highlightGroups: HighlightGroup[] = [
  {
    title: "South African Classics",
    tone: "amber",
    description: "Air-dried and spiced favorites for road trips, hikes, and rugby weekends.",
    items: [
      { name: "Biltong", fallback: "$9.50 /100g", unit: "100g" },
      { name: "DryWors", fallback: "$8.50 /100g", unit: "100g" },
      { name: "Boerewors", fallback: "$11.50 /lb" },
    ],
  },
  {
    title: "Premium Bison Cuts",
    tone: "emerald",
    description: "Lean, naturally sweet protein—great for high-performance meal prep.",
    items: [
      { name: "Bison Striploin", fallback: "$26.00 /lb" },
      { name: "Bison Ribeye", fallback: "$28.00 /lb" },
      { name: "Ground Bison", fallback: "$12.50 /lb" },
    ],
  },
  {
    title: "Traditional European Sausages",
    tone: "slate",
    description: "Old-world spice blends for grilling boards and family dinners.",
    items: [
      { name: "Kielbasa", fallback: "$9.50 /lb" },
      { name: "Kabanos", fallback: "$12.00 /lb" },
      { name: "Hunter's Sausage", fallback: "$10.00 /lb" },
    ],
  },
];

type QuoteFormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  fulfillment: string;
  message: string;
};

function PricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productError, setProductError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<QuoteFormState>({
    name: "",
    phone: "",
    email: "",
    address: "",
    fulfillment: "Local pickup",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getProducts(undefined, controller.signal)
      .then((result) => setProducts(result))
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch products", error);
        setProductError("Live product pricing is temporarily unavailable.");
      });

    return () => controller.abort();
  }, []);

  const productPriceMap = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((product) => map.set(product.name.toLowerCase(), product.price_cents));
    return map;
  }, [products]);

  const highlightPrice = (item: HighlightItem) => {
    const cents = productPriceMap.get(item.name.toLowerCase());
    if (!cents) return item.fallback;
    const unit = item.unit ?? "lb";
    return `$${(cents / 100).toFixed(2)} /${unit}`;
  };

  const handleChange = (key: keyof QuoteFormState, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormStatus("idle");
    setFormError(null);

    try {
      await submitQuoteRequest({
        name: formValues.name.trim(),
        phone: formValues.phone.trim(),
        email: formValues.email.trim(),
        address: formValues.address.trim(),
        fulfillment: formValues.fulfillment,
        message: formValues.message.trim(),
      });
      setFormStatus("success");
      setFormValues({
        name: "",
        phone: "",
        email: "",
        address: "",
        fulfillment: "Local pickup",
        message: "",
      });
    } catch (error) {
      console.error("Failed to submit quote request", error);
      setFormStatus("error");
      setFormError("We couldn't send your request right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pricing-page">
      <section className="container pricing-hero">
        <div className="pricing-hero__grid">
          <div className="pricing-hero__copy">
            <div className="eyebrow">Pricing</div>
            <h1>Bulk beef pricing built for families filling the freezer.</h1>
            <p className="muted">
              Buy a half cow with clear expectations: transparent weight ranges, clean trim, and the option to keep
              bones, organs, and fat. We cut for weeknight grilling, slow roasts, and plenty of ground beef.
            </p>
            <div className="pricing-hero__tags">
              <span className="pill pill--strong">Half cow · $7.50/lb</span>
              <span className="pill">Avg hanging weight 360–420 lb</span>
              <span className="pill">Custom wrap + delivery options</span>
            </div>
            <div className="pricing-hero__actions">
              <a className="btn btn--primary" href="#quote">
                Request a quote
              </a>
              <Link to="/menu" className="btn btn--ghost">
                Shop individual cuts
              </Link>
            </div>
          </div>

          <div className="pricing-main-card">
            <div className="pricing-main-card__header">
              <div>
                <div className="eyebrow eyebrow--green">Bulk buy</div>
                <h3>1/2 Cow to Buy – $7.50/lb</h3>
                <p className="muted">Transparent cut list, vacuum sealing option, and delivery windows that work.</p>
              </div>
              <div className="pricing-main-card__price">
                <div className="pricing-main-card__price-value">$7.50</div>
                <div className="pricing-main-card__price-note">per lb hanging weight</div>
              </div>
            </div>
            <div className="pricing-main-card__body">
              <div className="pricing-main-card__summary">
                <div className="pricing-chip">Steaks</div>
                <div className="pricing-chip">Roasts</div>
                <div className="pricing-chip">Large cuts</div>
                <div className="pricing-chip">Ground beef</div>
                <div className="pricing-chip pricing-chip--muted">Optional items</div>
              </div>
              <ul className="pricing-main-card__list">
                {summaryItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="pricing-main-card__footer">
                <div>
                  <div className="pill pill--small">Grass-fed · Hormone-free</div>
                  <div className="pricing-main-card__note">
                    Typical yield is 210–250 lb take-home meat from a 1/2 share. We confirm exact weights before cutting.
                  </div>
                </div>
                <a className="link-button" href="#quote">
                  Lock in a spot →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container pricing-breakdown">
        <div className="pricing-section-header">
          <div>
            <div className="eyebrow">Cut sheet</div>
            <h2>Detailed breakdown—no surprises when you pick up.</h2>
          </div>
          <span className="pill pill--accent">Custom tweaks welcome</span>
        </div>
        <div className="pricing-breakdown__grid">
          <div className="pricing-breakdown__card">
            <div className="pricing-breakdown__label">Steaks</div>
            <ul>
              {steakCuts.map((cut) => (
                <li key={cut}>{cut}</li>
              ))}
            </ul>
          </div>
          <div className="pricing-breakdown__card">
            <div className="pricing-breakdown__label">Roasts</div>
            <ul>
              {roastCuts.map((cut) => (
                <li key={cut}>{cut}</li>
              ))}
            </ul>
          </div>
          <div className="pricing-breakdown__card">
            <div className="pricing-breakdown__label">Large Cuts</div>
            <ul>
              {largeCuts.map((cut) => (
                <li key={cut}>{cut}</li>
              ))}
            </ul>
          </div>
          <div className="pricing-breakdown__card">
            <div className="pricing-breakdown__label">Ground Beef</div>
            <ul>
              {groundNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
          <div className="pricing-breakdown__card pricing-breakdown__card--accent">
            <div className="pricing-breakdown__label">Optional Items</div>
            <ul>
              {optionalItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="muted">Let us know at booking—otherwise we trim like a typical family freezer package.</p>
          </div>
        </div>
      </section>

      <section className="container pricing-weights">
        <div className="pricing-section-header">
          <div>
            <div className="eyebrow">Weight breakdown</div>
            <h2>What a typical 1/2 beef yields by category.</h2>
            <p className="muted">Ranges shift by animal. We confirm before cutting, and you choose which items to keep.</p>
          </div>
        </div>
        <div className="pricing-weights__grid">
          {weightBreakdown.map((item) => (
            <div key={item.label} className="weight-card">
              <div className="weight-card__label">{item.label}</div>
              <div className="weight-card__amount">{item.amount}</div>
              <div className="weight-card__note">{item.note}</div>
            </div>
          ))}
        </div>
        <div className="vacuum-card">
          <div>
            <div className="eyebrow eyebrow--green">Vacuum sealing</div>
            <h3>Vacuum sealing $0.10/lb</h3>
            <p>
              Heavy-duty vacuum seal adds freezer life and keeps labels readable. Paper wrap is still available at no
              extra cost—tell us your preference when you book.
            </p>
          </div>
          <div className="vacuum-card__meta">
            <span className="pill pill--accent">Longer freezer life</span>
            <span className="pill">Great for meal prep</span>
          </div>
        </div>
      </section>

      <section className="container pricing-highlights">
        <div className="pricing-section-header">
          <div>
            <div className="eyebrow">Highlighted products</div>
            <h2>Favorites alongside your beef order.</h2>
          </div>
          {productError ? <span className="pill pill--small">{productError}</span> : <span className="pill">Live shop pricing when available</span>}
        </div>
        <div className="pricing-highlight__grid">
          {highlightGroups.map((group) => (
            <div key={group.title} className={`highlight-card highlight-card--${group.tone}`}>
              <div className="highlight-card__header">
                <div className="eyebrow">[{group.tone}] add-on</div>
                <h3>{group.title}</h3>
                <p className="muted">{group.description}</p>
              </div>
              <ul className="highlight-card__list">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <span>{item.name}</span>
                    <span className="highlight-card__price">{highlightPrice(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pricing-specialties">
          <div className="pricing-specialties__label">Other specialties</div>
          <div className="pricing-specialties__items">
            <span className="pill pill--small">Cerevita</span>
            <span className="pill pill--small">Kasi favorites</span>
            <span className="pill pill--small">Zimbabwean tea</span>
            <span className="pill pill--small">Georgian Satsebeli</span>
            <span className="pill pill--small">Spice kits</span>
          </div>
          <Link to="/menu" className="link-button">
            See the shop →
          </Link>
        </div>
      </section>

      <section className="container pricing-quote" id="quote">
        <div className="quote-card">
          <div className="quote-card__intro">
            <div className="eyebrow eyebrow--green">Quote / Inquiry</div>
            <h2>Tell us how you want your beef packed.</h2>
            <p className="muted">
              We confirm hanging weight, cut sheet, and pickup/delivery options, then send a simple email confirmation.
              No online payment is collected here.
            </p>
            <ul className="checklist">
              <li>We reply with weight confirmation and total.</li>
              <li>Pickup from the shop or route delivery windows available.</li>
              <li>Ask about adding bison, sausages, or specialties to the same order.</li>
            </ul>
          </div>

          <form className="quote-form" onSubmit={handleSubmit}>
            <div className="quote-form__grid">
              <label className="quote-form__field">
                <span>Name</span>
                <input
                  required
                  type="text"
                  value={formValues.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                />
              </label>
              <label className="quote-form__field">
                <span>Phone</span>
                <input
                  required
                  type="tel"
                  value={formValues.phone}
                  onChange={(event) => handleChange("phone", event.target.value)}
                />
              </label>
              <label className="quote-form__field">
                <span>Email</span>
                <input
                  required
                  type="email"
                  value={formValues.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                />
              </label>
              <label className="quote-form__field">
                <span>Address</span>
                <input
                  required
                  type="text"
                  value={formValues.address}
                  onChange={(event) => handleChange("address", event.target.value)}
                />
              </label>
              <label className="quote-form__field">
                <span>Preferred pickup / delivery</span>
                <select
                  value={formValues.fulfillment}
                  onChange={(event) => handleChange("fulfillment", event.target.value)}
                >
                  <option>Local pickup</option>
                  <option>Delivery on route</option>
                  <option>Ship to province</option>
                  <option>Undecided</option>
                </select>
              </label>
              <label className="quote-form__field quote-form__field--full">
                <span>Message</span>
                <textarea
                  rows={4}
                  placeholder="Cut preferences, pack size, desired timeline..."
                  value={formValues.message}
                  onChange={(event) => handleChange("message", event.target.value)}
                />
              </label>
            </div>
            {formError && <div className="alert alert--error">{formError}</div>}
            {formStatus === "success" && (
              <div className="alert alert--muted">Thanks! We received your request and will email you back.</div>
            )}
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? "Sending..." : "Send quote request"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default PricingPage;
