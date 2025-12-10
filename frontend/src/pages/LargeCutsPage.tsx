import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Beef,
  ChefHat,
  Drumstick,
  Fish,
  Flame,
  Package,
  PiggyBank,
  Snowflake,
  Sprout,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getProducts } from "../api/products";
import largeCutsHero from "../assets/hero-large-cuts.jpg";
import ProductGrid from "../components/products/ProductGrid";
import type { Product } from "../types";

type LargeCutCategory = "all" | "beef" | "poultry" | "lamb" | "pork" | "fish";

const categoryFilters: {
  key: LargeCutCategory;
  label: string;
  icon: typeof Package;
}[] = [
  { key: "all", label: "All large cuts", icon: Package },
  { key: "beef", label: "Beef", icon: Beef },
  { key: "poultry", label: "Poultry", icon: Drumstick },
  { key: "lamb", label: "Lamb", icon: Sprout },
  { key: "pork", label: "Pork", icon: PiggyBank },
  { key: "fish", label: "Fish", icon: Fish },
];

const largeCutPatterns = [
  /brisket/i,
  /prime\s*rib/i,
  /short\s*rib/i,
  /back\s*rib/i,
  /rib\s*roast/i,
  /\broast\b/i,
  /\bsirloin tip\b/i,
  /\bblade\b/i,
  /\bchuck\b/i,
  /\bshoulder\b/i,
  /\bbutt\b/i,
  /\bham\b/i,
  /\bbelly\b/i,
  /\brack\b/i,
  /\bleg\b/i,
  /\bloin\b/i,
  /\bpicanha\b/i,
  /\btri-?tip\b/i,
  /\bshank\b/i,
  /\bwhole\b/i,
  /\bhalf\b/i,
  /\bquarter\b/i,
  /\bside\b/i,
  /\bfamily\b/i,
  /\bbulk\b/i,
  /\bcase\b/i,
  /\bpacker\b/i,
  /\bturkey\b/i,
  /\bduck\b/i,
  /\bgoose\b/i,
];

const speciesMatchers: Record<Exclude<LargeCutCategory, "all">, RegExp[]> = {
  beef: [/beef/i, /bison/i, /brisket/i, /chuck/i, /sirloin/i, /striploin/i, /rib/i],
  poultry: [/chicken/i, /turkey/i, /duck/i, /hen/i, /poultry/i],
  lamb: [/lamb/i, /mutton/i, /sheep/i],
  pork: [/pork/i, /hog/i, /ham/i, /belly/i, /butt/i, /shoulder/i, /loin/i],
  fish: [/fish/i, /salmon/i, /cod/i, /trout/i, /halibut/i, /herring/i, /mackerel/i],
};

const featureTiles = [
  {
    title: "Smoker & roaster ready",
    detail: "Packers, whole loins, racks, and shoulders trimmed for long cooks.",
    icon: Flame,
  },
  {
    title: "Cold chain intact",
    detail: "Frozen core with insulated liners and ice—no warm corners in transit.",
    icon: Snowflake,
  },
  {
    title: "Delivery or pickup",
    detail: "Route delivery, shop pickup, or combine with regular shop orders.",
    icon: Truck,
  },
];

const prepNotes = [
  {
    title: "Family-sized formats",
    description: "Whole briskets, crown roasts, and racks sized for gatherings and smokers.",
  },
  {
    title: "Pack for your pit",
    description: "Leave fat on for rendering, or ask for a tidy trim if you want simple oven work.",
  },
  {
    title: "Season or brine ready",
    description: "Labelled in clear bags so you can go straight from fridge to smoke or roast.",
  },
];

const getSpecies = (product: Product): LargeCutCategory | null => {
  const haystack = `${product.category ?? ""} ${product.name}`.toLowerCase();

  for (const [key, patterns] of Object.entries(speciesMatchers) as [Exclude<LargeCutCategory, "all">, RegExp[]][]) {
    if (patterns.some((pattern) => pattern.test(haystack))) {
      return key;
    }
  }

  return null;
};

const isLargeFormat = (product: Product) => {
  const haystack = `${product.name} ${product.description ?? ""} ${product.category ?? ""}`.toLowerCase();
  const steakOnly =
    haystack.includes("steak") &&
    !/(whole|half|roast|rib|brisket|striploin|sirloin|family|bulk|case|loin roast|picanha)/i.test(haystack);

  if (steakOnly) return false;

  return largeCutPatterns.some((pattern) => pattern.test(haystack));
};

const AnimalBadge = ({ icon: Icon, active }: { icon: typeof Package; active: boolean }) => (
  <div
    className={`relative h-12 w-12 rounded-full flex items-center justify-center shadow-[0_14px_30px_-18px_rgba(239,68,68,0.8)] ${
      active ? "bg-gradient-to-br from-red-500 via-red-600 to-red-700" : "bg-gradient-to-br from-red-400 to-red-600"
    }`}
  >
    <div className="absolute inset-0 rounded-full border border-white/30" />
    <Icon size={22} className="text-white drop-shadow" strokeWidth={2.2} />
  </div>
);

function LargeCutsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LargeCutCategory>("all");
  const catalogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getProducts(undefined, controller.signal)
      .then((result) => setProducts(result))
      .catch((fetchError) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load products", fetchError);
        setError("Live inventory is temporarily unavailable.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const largeCutPool = useMemo(() => {
    const flagged = products.filter(isLargeFormat);
    if (flagged.length) return flagged;
    return products;
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (selectedCategory === "all") {
      return [...largeCutPool].sort((a, b) => b.price_cents - a.price_cents);
    }

    return largeCutPool
      .filter((product) => getSpecies(product) === selectedCategory)
      .sort((a, b) => b.price_cents - a.price_cents);
  }, [largeCutPool, selectedCategory]);

  const countsByCategory = useMemo(() => {
    const counts = new Map<LargeCutCategory, number>();
    largeCutPool.forEach((product) => {
      const species = getSpecies(product) ?? "all";
      counts.set("all", (counts.get("all") ?? 0) + 1);
      counts.set(species, (counts.get(species) ?? 0) + 1);
    });
    return counts;
  }, [largeCutPool]);

  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const heroStatLine = largeCutPool.length
    ? `${largeCutPool.length}+ large-format options`
    : loading
      ? "Loading inventory"
      : "Large cuts sell fast—ask to reserve";

  return (
    <div className="landing-page bg-black text-white">
      <section className="landing-section bg-gradient-to-br from-black via-[#120a10] to-[#04070b] py-16 md:py-20 border-b border-red-900/50">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div className="space-y-6">
            <p className="text-red-400 uppercase tracking-[0.22em] text-xs">Large Cuts • Smoker & Roast Ready</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
              Whole briskets, ribs, and centerpieces sized for gatherings.
            </h1>
            <p className="text-gray-200 max-w-2xl">
              Big-format briskets, ribs, and roasts trimmed for pits and slow ovens. We leave fat where it matters and
              keep labels readable so prep is easy.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={scrollToCatalog}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-[0_18px_42px_-24px_rgba(248,113,113,0.8)]"
              >
                Browse large cuts
              </button>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition-colors"
              >
                Ask for a custom trim
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-white/85">
              <span className="border border-white/20 px-4 py-2 rounded-full">Smoker & roaster formats</span>
              <span className="border border-white/20 px-4 py-2 rounded-full">0–4°C cold-packed</span>
              <span className="border border-white/20 px-4 py-2 rounded-full">Delivery or pickup</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              {featureTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <div
                    key={tile.title}
                    className="border border-white/10 bg-white/5 rounded-2xl p-4 shadow-lg flex gap-3 items-start"
                  >
                    <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-red-200">
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{tile.title}</div>
                      <p className="text-sm text-gray-200/90">{tile.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-10 h-28 w-28 bg-red-600/10 blur-3xl rounded-full" />
            <div className="absolute -right-10 bottom-0 h-32 w-32 bg-rose-500/10 blur-3xl rounded-full" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.8)]">
              <img
                src={largeCutsHero}
                alt="Whole briskets, ribs, and roasts ready for the pit"
                className="w-full h-full object-cover aspect-[4/3] lg:aspect-[5/4]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/10 to-transparent" />
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-semibold">
                <Flame size={14} className="text-red-200" />
                Smoker ready
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-3">
                <div className="flex-1 min-w-[180px] rounded-2xl bg-black/65 border border-white/10 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/70">Large format lane</div>
                  <div className="text-lg font-semibold text-white">{heroStatLine}</div>
                  <div className="text-xs text-white/70">Trim left on where it matters.</div>
                </div>
                <div className="flex-1 min-w-[180px] rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-white">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/80">Cold chain</div>
                  <div className="text-lg font-semibold">Insulated liners + ice</div>
                  <div className="text-xs text-white/80">Delivery and pickup windows.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-[#f8f4ed] text-[#0f0f1f] py-14 md:py-18" ref={catalogRef} id="large-cuts">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-8 md:space-y-10">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <p className="text-red-600 uppercase tracking-[0.25em] text-xs">Shop</p>
              <h2 className="text-4xl font-semibold">Large cuts by animal.</h2>
              <p className="text-gray-600 max-w-2xl">
                Tap a category to filter. Inventory is live—when a roast or packer sells out it disappears here. If you
                need something not listed, hit contact and we will hold it.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-black text-white">
                {countsByCategory.get("all") ?? 0} items
              </span>
              <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                {selectedCategory === "all" ? "All large cuts" : `Filtered: ${selectedCategory}`}
              </span>
              {largeCutPool.length === products.length && (
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
                  Showing full catalog until more large cuts load
                </span>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {categoryFilters.map((filter) => {
              const Icon = filter.icon;
              const isActive = selectedCategory === filter.key;
              const count = countsByCategory.get(filter.key) ?? 0;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setSelectedCategory(filter.key)}
                  className={`relative overflow-hidden rounded-2xl border p-4 flex flex-col gap-3 transition shadow-sm ${
                    isActive
                      ? "border-black bg-gradient-to-br from-black to-[#1b1b22] text-white shadow-xl shadow-red-900/30"
                      : "border-[#e8e1d8] bg-white text-gray-900 hover:-translate-y-1 hover:shadow-xl"
                  }`}
                >
                  <div className="absolute inset-x-0 -top-8 h-20 bg-gradient-to-r from-white/30 via-white/20 to-white/10 rounded-[999px] blur-3xl opacity-60" />
                  <div className="flex items-center justify-between gap-2">
                    <AnimalBadge icon={Icon} active={isActive} />
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        isActive
                          ? "bg-white/10 text-white border-white/20"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-base font-semibold leading-tight">{filter.label}</div>
                    <p className={`text-xs ${isActive ? "text-white/70" : "text-gray-500"}`}>
                      {filter.key === "all" ? "Everything big" : "Filter by animal"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-3xl border border-red-100 shadow-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-[0.22em] text-red-600">Large-format catalog</div>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">
                    {visibleProducts.length} products
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">
                    {selectedCategory === "all" ? "All animals" : selectedCategory}
                  </span>
                  {error && (
                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                      {error}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-2 rounded-full bg-black text-white inline-flex items-center gap-2">
                  <ChefHat size={14} /> Trim requests welcome
                </span>
                <span className="px-3 py-2 rounded-full bg-gray-100 text-gray-800 inline-flex items-center gap-2">
                  <Snowflake size={14} /> Cold held
                </span>
              </div>
            </div>

            <ProductGrid products={visibleProducts} loading={loading} />

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
              <div>
                Prefer a specific weight or trim? Add a note at checkout or{" "}
                <Link to="/contact" className="font-semibold text-red-700">
                  contact us
                </Link>{" "}
                to hold it.
              </div>
              <div className="px-3 py-2 rounded-lg bg-gray-100 border border-gray-200">
                Inventory updates in real time—large cuts disappear when sold.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-black text-white py-14 md:py-16 border-t border-red-900/50">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 lg:px-14 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-3">
            <div>
              <p className="text-red-400 uppercase tracking-[0.22em] text-xs">How we pack</p>
              <h3 className="text-3xl font-semibold">Large format without the guesswork.</h3>
            </div>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-semibold hover:bg-red-600 hover:text-white transition-colors"
            >
              Cart & checkout <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {prepNotes.map((note) => (
              <div
                key={note.title}
                className="border border-white/10 bg-white/5 rounded-2xl p-5 shadow-[0_28px_64px_-48px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-red-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  Large Cut
                </div>
                <div className="text-xl font-semibold text-white mt-2">{note.title}</div>
                <p className="text-sm text-gray-200 mt-2">{note.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default LargeCutsPage;
