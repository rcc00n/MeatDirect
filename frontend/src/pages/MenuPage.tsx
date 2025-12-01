import { useEffect, useMemo, useRef, useState } from "react";
import { Drumstick, Fish, Flame, Search, Snowflake, Truck } from "lucide-react";
import { Link } from "react-router-dom";

import { getProducts } from "../api/products";
import { ProductCard as HighlightProductCard } from "../components/ProductCard";
import ProductGrid from "../components/products/ProductGrid";
import type { Product } from "../types";

type CategoryTab = {
  label: string;
  value: string | null;
  note: string;
};

const CATEGORY_TABS: CategoryTab[] = [
  { label: "All items", value: null, note: "Full butcher case" },
  { label: "Meat", value: "meat", note: "Beef, pork, bison, lamb" },
  { label: "Poultry", value: "poultry", note: "Chicken, turkey, duck" },
  { label: "Sausages", value: "sausages", note: "Links, patties, pepperoni" },
  { label: "Smoked Fish", value: "smoked fish", note: "Salmon, spreads, fillets" },
  { label: "European Products", value: "european products", note: "Kielbasa, pierogi, pantry" },
  { label: "South African", value: "south african", note: "Boerewors, biltong, spices" },
];

const curatedCollections = [
  {
    name: "Grass-fed Beef",
    description: "Pasture-raised steaks, roasts, and butcher-favorite grinds.",
    icon: Drumstick,
    category: "meat",
  },
  {
    name: "Smoked & Cured",
    description: "European-style sausages, pepperoni sticks, and slow-smoked classics.",
    icon: Flame,
    category: "sausages",
  },
  {
    name: "Seafood & Poultry",
    description: "Fresh poultry staples plus smoked fish for easy dinners.",
    icon: Fish,
    category: "smoked fish",
  },
];

const formatPrice = (priceCents: number) => `$${(priceCents / 100).toFixed(2)}`;

function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const catalogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getProducts(
      {
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
      },
      controller.signal,
    )
      .then((result) => setProducts(result))
      .catch((fetchError) => {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch products", fetchError);
        setError("Unable to load products right now. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedSearch, selectedCategory]);

  const featuredProducts = useMemo(() => products.filter((product) => product.is_popular).slice(0, 3), [products]);
  const activeTab = useMemo(
    () => CATEGORY_TABS.find((tab) => tab.value === selectedCategory) ?? CATEGORY_TABS[0],
    [selectedCategory],
  );

  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    scrollToCatalog();
  };

  const resultLabel = selectedCategory ? `${activeTab.label} ready to ship` : "All categories available";

  return (
    <div className="landing-page space-y-0 bg-black text-white">
      <section className="landing-section bg-gradient-to-br from-black via-red-950 to-black py-16 border-b-2 border-red-600">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 grid md:grid-cols-[1.05fr_0.95fr] gap-12 items-start">
          <div className="space-y-4">
            <p className="text-red-400 uppercase tracking-[0.2em] text-xs">Shop • Butcher Case</p>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">Shop the full MeatDirect lineup.</h1>
            <p className="text-gray-300 max-w-2xl">
              Filter by craving, check pricing, and add to cart. Every order leaves our cold room trimmed, labeled, and
              packed.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={scrollToCatalog}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Browse catalog
              </button>
              <Link
                to="/pricing"
                className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition-colors"
              >
                Pricing for bulk
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="border border-gray-700 px-4 py-2 rounded-full text-sm text-gray-200">Hormone-free</span>
              <span className="border border-gray-700 px-4 py-2 rounded-full text-sm text-gray-200">
                Cold-packed shipping
              </span>
              <span className="border border-gray-700 px-4 py-2 rounded-full text-sm text-gray-200">
                Local delivery & pickup
              </span>
              <span className="bg-red-600 px-4 py-2 rounded-full text-sm">Add-to-cart ready</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              {[
                { label: "Live items", value: products.length ? `${products.length}+` : "Ready" },
                { label: "Cold-packed shipping", value: "Nationwide" },
                { label: "Local delivery", value: "Next-day" },
              ].map((stat) => (
                <div key={stat.label} className="border border-red-900 bg-white/5 rounded-xl p-3">
                  <div className="text-sm text-gray-300">{stat.label}</div>
                  <div className="text-xl font-semibold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white text-black p-8 rounded-xl shadow-2xl space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-red-600 uppercase tracking-wider text-sm">Popular this week</p>
                <h3 className="text-2xl font-semibold">What customers reorder</h3>
              </div>
              <span className="text-sm text-gray-500">{products.length} items</span>
            </div>
            <div className="space-y-3">
              {featuredProducts.length ? (
                featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border-b last:border-b-0 border-gray-200 pb-3"
                  >
                    <div>
                      <div className="font-semibold text-black">{product.name}</div>
                      {product.category && <div className="text-xs text-gray-500">{product.category}</div>}
                    </div>
                    <div className="text-red-600 font-semibold">{formatPrice(product.price_cents)}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4">
                  Mark products as popular in the admin to feature them here.
                </div>
              )}
            </div>
            <div className="bg-black text-white rounded-xl p-4 border border-red-700 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Snowflake className="text-red-400" size={18} />
                <div className="font-semibold">Cold chain intact</div>
              </div>
              <p className="text-sm text-gray-200">
                Packed with liners and ice packs. Choose pickup or delivery during checkout.
              </p>
              <button
                type="button"
                onClick={scrollToCatalog}
                className="self-start bg-white text-black px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Shop the case
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-white text-black py-16" ref={catalogRef} id="shop">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <p className="text-red-600 uppercase tracking-wider text-sm">Shop</p>
              <h2 className="text-4xl font-semibold">Browse the catalog by craving.</h2>
              <p className="text-gray-600 mt-2">Search a cut, pick a region, and drop items straight into the cart.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-black text-white">{products.length} items</span>
              <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">{resultLabel}</span>
              {debouncedSearch && (
                <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                  Search: {debouncedSearch}
                </span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-[1.3fr_0.7fr] gap-6 items-start">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-100">
                <Search className="text-gray-400" size={18} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search for cuts, farms, or tags"
                  className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = selectedCategory === tab.value;
                  return (
                    <button
                      key={tab.label}
                      type="button"
                      onClick={() => handleCategorySelect(tab.value)}
                      className={`rounded-full border-2 px-4 py-2 text-left transition-colors shadow-sm ${
                        isActive
                          ? "border-red-600 bg-red-50 text-red-700"
                          : "border-gray-300 bg-white text-gray-800 hover:border-red-200"
                      }`}
                    >
                      <div className="font-semibold text-sm">{tab.label}</div>
                      <div className="text-xs text-gray-500">{tab.note}</div>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="px-3 py-1 rounded-full bg-black text-white">{activeTab.label}</span>
                <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800">{products.length} products</span>
                {debouncedSearch && (
                  <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                    Search: "{debouncedSearch}"
                  </span>
                )}
              </div>
            </div>

            <div className="bg-black text-white rounded-2xl border-2 border-red-600 p-6 space-y-4 shadow-xl">
              <p className="text-red-400 uppercase tracking-[0.2em] text-xs">How we pack</p>
              <h3 className="text-2xl font-semibold">Butcher-cut, cold, and ready to cook.</h3>
              <div className="space-y-3 text-sm text-white/80">
                <div className="flex gap-3">
                  <span className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center font-bold">
                    1
                  </span>
                  <div>
                    <div className="font-semibold">Choose your section</div>
                    <p className="text-white/70">Use the tabs to jump straight to beef, sausages, seafood, or imports.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center font-bold">
                    2
                  </span>
                  <div>
                    <div className="font-semibold">Add exact cuts</div>
                    <p className="text-white/70">See pricing before checkout and add to cart with one click.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center font-bold">
                    3
                  </span>
                  <div>
                    <div className="font-semibold">Delivery or pickup</div>
                    <p className="text-white/70">Insulated liners, ice packs, and next-day local delivery options.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="bg-white text-black px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  onClick={() => handleCategorySelect("sausages")}
                >
                  Shop sausages
                </button>
                <button
                  type="button"
                  className="border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-black transition-colors"
                  onClick={() => handleCategorySelect("smoked fish")}
                >
                  Smoked fish
                </button>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-white/80">
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-700">
                  <Truck size={16} /> Next-day local delivery
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-700">
                  <Snowflake size={16} /> Cold-packed shipping
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {curatedCollections.map((collection) => (
              <HighlightProductCard
                key={collection.name}
                name={collection.name}
                description={collection.description}
                icon={collection.icon}
                ctaLabel="View cuts"
                onClick={() => handleCategorySelect(collection.category)}
              />
            ))}
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>}

          <ProductGrid products={products} loading={loading} />
        </div>
      </section>
    </div>
  );
}

export default MenuPage;
