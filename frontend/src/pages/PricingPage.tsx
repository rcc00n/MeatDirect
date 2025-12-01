import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Snowflake, Truck } from "lucide-react";
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

type CutSheetSection = {
  title: string;
  description: string;
  items: string[];
  accent: string;
  chip: string;
  dark?: boolean;
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

const cutSheetSections: CutSheetSection[] = [
  {
    title: "Steaks",
    description: "Ribeye, striploin, sirloin, medallions trimmed for pan or grill.",
    items: steakCuts,
    accent: "from-red-50 via-white to-white",
    chip: "Grill cuts",
  },
  {
    title: "Roasts",
    description: "Comfort staples trimmed and tied for slow cookers and ovens.",
    items: roastCuts,
    accent: "from-gray-50 via-white to-white",
    chip: "Slow and tender",
  },
  {
    title: "Large cuts",
    description: "Smoker-ready brisket, ribs, and weekend roasts.",
    items: largeCuts,
    accent: "from-amber-50 via-white to-white",
    chip: "Smokers love",
  },
  {
    title: "Ground beef",
    description: "Lean blend ground from trim + muscle for weeknight meals.",
    items: groundNotes,
    accent: "from-slate-50 via-white to-white",
    chip: "Everyday meals",
  },
  {
    title: "Optional items",
    description: "Keep bones, organs, or fat if you want the whole animal value.",
    items: optionalItems,
    accent: "from-black via-red-950 to-black",
    chip: "By request",
    dark: true,
  },
];

const heroStats = [
  { label: "Half cow pricing", value: "$7.50/lb", note: "Hanging weight confirmed before cutting" },
  { label: "Take-home yield", value: "210–250 lb", note: "Trimmed, labeled, freezer ready" },
  { label: "Lead time", value: "1–2 weeks", note: "Pickup or delivery windows" },
];

const fulfillmentOptions = ["Local pickup", "Delivery on route", "Ship to province", "Undecided"];

const assuranceItems = [
  {
    title: "Cold chain intact",
    detail: "Insulated liners, ice packs, and rapid pickup windows keep everything chilled.",
    icon: Snowflake,
  },
  {
    title: "Flexible delivery",
    detail: "Choose shop pickup or route delivery—confirmed as soon as you book.",
    icon: Truck,
  },
  {
    title: "Transparent weights",
    detail: "We confirm hanging weight before we touch a knife so pricing stays clear.",
    icon: ShieldCheck,
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

  const toneClassNames: Record<HighlightGroup["tone"], string> = {
    amber: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white",
    emerald: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white",
    slate: "border-gray-200 bg-gradient-to-br from-slate-50 via-white to-white",
  };

  const primaryChips = ["Steaks", "Roasts", "Large cuts", "Ground beef", "Optional extras"];

  return (
    <div className="landing-page bg-black text-white">
      <section className="landing-section bg-gradient-to-br from-black via-red-950 to-black py-16 border-b-2 border-red-600">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
          <div className="space-y-5">
            <p className="text-red-400 uppercase tracking-[0.2em] text-xs">Pricing • Half & Whole</p>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Bulk beef pricing built for families filling the freezer.
            </h1>
            <p className="text-gray-300 max-w-2xl">
              Buy a half cow with clear expectations: transparent weight ranges, clean trim, and the option to keep
              bones, organs, and fat. We cut for weeknight grilling, slow roasts, and plenty of ground beef.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="border border-red-900 bg-white/5 text-white px-4 py-2 rounded-full text-sm">
                Half cow · $7.50/lb hanging
              </span>
              <span className="border border-gray-800 px-4 py-2 rounded-full text-sm text-gray-200">
                Avg hanging 360–420 lb
              </span>
              <span className="border border-gray-800 px-4 py-2 rounded-full text-sm text-gray-200">
                Custom wrap or vacuum seal
              </span>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="#quote"
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reserve my share
              </a>
              <Link
                to="/menu"
                className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition-colors"
              >
                Shop individual cuts
              </Link>
              <Link
                to="/menu#shop"
                className="text-red-400 font-semibold inline-flex items-center gap-2 hover:text-red-300"
              >
                See live inventory <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              {heroStats.map((stat) => (
                <div key={stat.label} className="border border-red-900 bg-white/5 rounded-xl p-4 shadow-lg">
                  <div className="text-sm text-red-200 uppercase tracking-wider">{stat.label}</div>
                  <div className="text-2xl font-semibold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-300">{stat.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white text-black rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="uppercase tracking-[0.22em] text-xs">Half / Whole Beef</p>
                <h3 className="text-3xl font-semibold">Half Cow · $7.50/lb</h3>
                <p className="text-white/80">
                  Transparent cut list, vacuum sealing optional, and delivery windows that work.
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/70">Avg hanging</div>
                <div className="text-2xl font-semibold">360–420 lb</div>
                <div className="text-sm text-white/70">Deposit confirmed at booking</div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                {primaryChips.map((label) => (
                  <span
                    key={label}
                    className="px-3 py-2 rounded-full bg-red-50 text-red-800 text-sm font-semibold border border-red-100"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <ul className="space-y-2 text-gray-700">
                {summaryItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="text-red-600 mt-0.5" size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600">
                  Take-home yield averages 210–250 lb after trim. We confirm weights before we cut.
                </div>
                <a
                  href="#quote"
                  className="bg-black text-white px-5 py-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Lock in a spot
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-white text-black py-16">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <p className="text-red-600 uppercase tracking-wider text-sm">Cut sheet</p>
              <h2 className="text-4xl font-semibold">Detailed breakdown—no surprises at pickup.</h2>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Tell us how thick you want steaks, how big to portion ground, and whether you want bones or fat kept.
                The cut sheet is yours to tweak.
              </p>
            </div>
            <span className="px-4 py-2 rounded-full bg-red-50 text-red-700 border border-red-100">
              Custom tweaks welcome
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cutSheetSections.map((section) => (
              <div
                key={section.title}
                className={`rounded-2xl border shadow-sm bg-gradient-to-br ${section.accent} ${
                  section.dark ? "border-red-800 text-white" : "border-gray-200 text-black"
                }`}
              >
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className={`text-2xl font-semibold ${section.dark ? "text-white" : "text-black"}`}>
                      {section.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        section.dark
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-red-50 text-red-700 border border-red-100"
                      }`}
                    >
                      {section.chip}
                    </span>
                  </div>
                  <p className={section.dark ? "text-white/80" : "text-gray-600"}>{section.description}</p>
                  <ul className={`space-y-2 ${section.dark ? "text-white/90" : "text-gray-800"}`}>
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span
                          className={`mt-1 h-2 w-2 rounded-full ${section.dark ? "bg-red-300" : "bg-red-600"}`}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-red-600 uppercase tracking-[0.2em] text-xs">Vacuum sealing</p>
              <h3 className="text-2xl font-semibold">Add heavy-duty vacuum seal for $0.10/lb</h3>
              <p className="text-gray-600">
                Paper wrap stays available at no extra cost—just tell us what you prefer when you book.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-2 rounded-full bg-black text-white text-sm">Longer freezer life</span>
              <span className="px-3 py-2 rounded-full bg-red-50 text-red-700 border border-red-100 text-sm">
                Great for meal prep
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-black text-white py-16 border-t-2 border-red-600">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <p className="text-red-500 uppercase tracking-wider text-sm">Weight breakdown</p>
              <h2 className="text-4xl font-semibold">What a typical 1/2 beef yields.</h2>
            </div>
            <p className="text-gray-300 max-w-lg">
              Ranges shift by animal. We confirm weights before cutting and walk through what you want to keep.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {weightBreakdown.map((item) => (
              <div
                key={item.label}
                className="bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-red-800/50 rounded-2xl p-4 shadow-lg"
              >
                <div className="text-sm uppercase tracking-wider text-red-300">{item.label}</div>
                <div className="text-2xl font-semibold text-white">{item.amount}</div>
                <div className="text-sm text-gray-300">{item.note}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {assuranceItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="border border-red-800/50 bg-white/5 rounded-2xl p-4 flex gap-3 items-start shadow-lg"
                >
                  <div className="h-10 w-10 rounded-xl bg-red-700/30 flex items-center justify-center text-red-200">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{item.title}</div>
                    <p className="text-sm text-gray-300">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="landing-section bg-white text-black py-16">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <p className="text-red-600 uppercase tracking-wider text-sm">Highlighted products</p>
              <h2 className="text-4xl font-semibold">Favorites to ride along with your beef order.</h2>
            </div>
            {productError ? (
              <span className="px-4 py-2 rounded-full bg-red-50 text-red-700 border border-red-200 text-sm">
                {productError}
              </span>
            ) : (
              <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 border border-gray-200 text-sm">
                Live shop pricing when available
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {highlightGroups.map((group) => (
              <div
                key={group.title}
                className={`rounded-2xl border p-6 shadow-sm ${toneClassNames[group.tone]} flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-red-600">Add-on</p>
                  <h3 className="text-2xl font-semibold">{group.title}</h3>
                  <p className="text-gray-600">{group.description}</p>
                </div>
                <ul className="divide-y divide-gray-200 pt-3">
                  {group.items.map((item) => (
                    <li key={item.name} className="flex items-center justify-between py-3 text-sm">
                      <span className="font-semibold text-black">{item.name}</span>
                      <span className="text-red-700 font-semibold">{highlightPrice(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <div>
              <div className="text-sm text-red-600 uppercase tracking-[0.2em]">Shop</div>
              <p className="text-gray-700">
                Add smoked fish, sausages, and pantry items to the same delivery window.
              </p>
            </div>
            <Link
              to="/menu"
              className="bg-black text-white px-5 py-3 rounded-lg hover:bg-red-600 transition-colors inline-flex items-center gap-2"
            >
              Browse the shop <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="landing-section bg-gradient-to-br from-black via-zinc-950 to-black text-white py-16 border-t-2 border-red-600"
        id="quote"
      >
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 grid lg:grid-cols-[1fr_1.05fr] gap-10 items-start">
          <div className="space-y-4">
            <p className="text-red-400 uppercase tracking-[0.2em] text-xs">Quote / Inquiry</p>
            <h2 className="text-4xl font-semibold">Tell us how you want your beef packed.</h2>
            <p className="text-gray-300">
              We confirm hanging weight, cut sheet, and pickup/delivery options, then send a simple email confirmation.
              No online payment is collected here.
            </p>
            <ul className="space-y-3">
              {[
                "We reply with weight confirmation and total.",
                "Pickup from the shop or choose route delivery windows.",
                "Ask about adding bison, sausages, or specialties to the same order.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/90">
                  <CheckCircle2 className="text-red-400 mt-0.5" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 text-sm text-gray-300">
              <span className="px-3 py-1 rounded-full border border-red-800/60 bg-white/5">
                No online payment collected
              </span>
              <span className="px-3 py-1 rounded-full border border-red-800/60 bg-white/5">
                One form covers the whole order
              </span>
            </div>
          </div>

          <form
            className="bg-white/5 border border-red-800/60 rounded-2xl p-6 shadow-2xl space-y-5"
            onSubmit={handleSubmit}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm text-white/80 space-y-2">
                <span>Name</span>
                <input
                  required
                  type="text"
                  value={formValues.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  className="w-full rounded-xl border border-red-900 bg-black/40 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-700/50"
                />
              </label>
              <label className="text-sm text-white/80 space-y-2">
                <span>Phone</span>
                <input
                  required
                  type="tel"
                  value={formValues.phone}
                  onChange={(event) => handleChange("phone", event.target.value)}
                  className="w-full rounded-xl border border-red-900 bg-black/40 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-700/50"
                />
              </label>
              <label className="text-sm text-white/80 space-y-2">
                <span>Email</span>
                <input
                  required
                  type="email"
                  value={formValues.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  className="w-full rounded-xl border border-red-900 bg-black/40 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-700/50"
                />
              </label>
              <label className="text-sm text-white/80 space-y-2">
                <span>Address</span>
                <input
                  required
                  type="text"
                  value={formValues.address}
                  onChange={(event) => handleChange("address", event.target.value)}
                  className="w-full rounded-xl border border-red-900 bg-black/40 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-700/50"
                />
              </label>
              <label className="text-sm text-white/80 space-y-2">
                <span>Preferred pickup / delivery</span>
                <select
                  value={formValues.fulfillment}
                  onChange={(event) => handleChange("fulfillment", event.target.value)}
                  className="w-full rounded-xl border border-red-900 bg-black/40 px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-700/50"
                >
                  {fulfillmentOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-white/80 space-y-2 md:col-span-2">
                <span>Message</span>
                <textarea
                  rows={4}
                  placeholder="Cut preferences, pack size, desired timeline..."
                  value={formValues.message}
                  onChange={(event) => handleChange("message", event.target.value)}
                  className="w-full rounded-xl border border-red-900 bg-black/40 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-700/50"
                />
              </label>
            </div>
            {formError && (
              <div className="text-sm text-red-300 border border-red-700 bg-red-950/50 rounded-lg p-3">{formError}</div>
            )}
            {formStatus === "success" && (
              <div className="text-sm text-green-200 border border-green-600/50 bg-green-950/40 rounded-lg p-3">
                Thanks! We received your request and will email you back.
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-red-600 text-white rounded-xl px-4 py-3 font-semibold hover:bg-red-700 transition-colors disabled:opacity-70"
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Send quote request"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default PricingPage;
