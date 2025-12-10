import { useEffect, useMemo, useRef, useState } from "react";
import { Drumstick, Fish, Flame, Search, Snowflake, Truck } from "lucide-react";
import { Link } from "react-router-dom";

import { getProducts } from "../api/products";
import { ProductCard as HighlightProductCard } from "../components/ProductCard";
import ProductGrid from "../components/products/ProductGrid";
import type { Product } from "../types";

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

const PAGE_SIZES = [25, 50, 75, 100];

const buildCategoryList = (items: Product[]): string[] => {
  const categories = new Map<string, string>();

  items.forEach((product) => {
    const value = product.category?.trim();
    if (!value) return;

    const key = value.toLowerCase();
    if (!categories.has(key)) {
      categories.set(key, value);
    }
  });

  return Array.from(categories.values()).sort((a, b) => a.localeCompare(b));
};

function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);
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
      .then((result) => {
        setProducts(result);
        setCategories((current) => {
          const derivedCategories = buildCategoryList(result);
          const shouldSyncCategories = !debouncedSearch && !selectedCategory;

          if (!derivedCategories.length) {
            return current;
          }

          if (!current.length || shouldSyncCategories) {
            return derivedCategories;
          }

          return current;
        });
      })
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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(Math.max(products.length, 1) / pageSize)),
    [products.length, pageSize],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, pageSize]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, currentPage, pageSize]);

  const showingStart = products.length ? (currentPage - 1) * pageSize + 1 : 0;
  const showingEnd = Math.min(products.length, currentPage * pageSize);

  const featuredProducts = useMemo(() => products.filter((product) => product.is_popular).slice(0, 3), [products]);
  const categoryLabel = selectedCategory || "All categories";

  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    scrollToCatalog();
  };

  const resultLabel = selectedCategory ? `${categoryLabel} ready to ship` : "All categories available";

  return (
    <div className="landing-page space-y-0 bg-black text-white">
      <section className="landing-section bg-gradient-to-br from-[#0b0b12] via-[#1b0a10] to-[#0c1718] py-16 md:py-20 border-b border-red-900/50">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-rose-200">
              <span className="hidden sm:block h-px w-10 bg-rose-200/60" />
              <span>Shop • Butcher Case</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">Shop the full MeatDirect lineup.</h1>
            <p className="text-lg text-white/75 max-w-2xl">
              Filter by craving, check pricing, and add to cart. Every order leaves our cold room trimmed, labeled, and packed.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={scrollToCatalog}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-[0_18px_40px_-28px_rgba(220,38,38,0.9)]"
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
            <div className="flex flex-wrap gap-2 text-sm text-white/80">
              <span className="border border-white/20 px-4 py-2 rounded-full">Hormone-free</span>
              <span className="border border-white/20 px-4 py-2 rounded-full">Cold-packed shipping</span>
              <span className="border border-white/20 px-4 py-2 rounded-full">Local delivery & pickup</span>
              <span className="bg-red-600 px-4 py-2 rounded-full text-white">Add-to-cart ready</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              {[
                { label: "Live items", value: products.length ? `${products.length}+` : "Ready" },
                { label: "Cold-packed shipping", value: "Nationwide" },
                { label: "Local delivery", value: "Next-day" },
              ].map((stat) => (
                <div key={stat.label} className="border border-white/10 bg-white/5 rounded-2xl p-4">
                  <div className="text-sm text-white/70">{stat.label}</div>
                  <div className="text-2xl font-semibold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/95 text-[#0f0f1f] p-8 rounded-3xl shadow-[0_34px_90px_-48px_rgba(0,0,0,0.65)] border border-rose-100 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-red-500 uppercase tracking-[0.24em] text-xs">Popular this week</p>
                  <h3 className="text-2xl font-semibold">What customers reorder</h3>
                  <p className="text-sm text-gray-600">Mark products as popular in the admin to feature them here.</p>
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
            </div>
            <div className="bg-gradient-to-r from-black via-[#120c0c] to-[#0d1b1c] text-white rounded-2xl p-5 border border-red-800/50 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Snowflake className="text-red-300" size={18} />
                <div>
                  <div className="font-semibold">Cold chain intact</div>
                  <p className="text-sm text-white/70">
                    Packed with liners and ice packs. Choose pickup or delivery during checkout.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-white/80">
                <span className="px-3 py-1 rounded-full border border-white/20">Cold-packed shipping</span>
                <span className="px-3 py-1 rounded-full border border-white/20">Local delivery & pickup</span>
              </div>
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

      <section className="landing-section bg-[#f8f4ed] text-[#0f0f1f] py-14 md:py-18" ref={catalogRef} id="shop">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-8 md:space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <p className="text-red-600 uppercase tracking-[0.25em] text-xs">Shop</p>
              <h2 className="text-4xl font-semibold">Browse the catalog by craving.</h2>
              <p className="text-gray-600">Search a cut, pick a region, and drop items straight into the cart.</p>
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

          <div className="grid xl:grid-cols-[320px_1fr] gap-6 items-start">
            <aside className="bg-gradient-to-b from-[#0c0c14] via-[#12070c] to-[#0c1718] text-white rounded-3xl p-5 lg:p-6 border border-red-900/50 shadow-[0_28px_90px_-48px_rgba(0,0,0,0.55)] lg:sticky lg:top-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="hidden xl:flex items-center justify-center rounded-2xl bg-white/5 h-32 w-12">
                  <span
                    className="text-[10px] tracking-[0.3em] uppercase text-white/70"
                    style={{ writingMode: "vertical-rl" }}
                  >
                    Filter
                  </span>
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-rose-200">Filter by craving</p>
                  <p className="text-white/70 text-sm">Use search or category to narrow the case.</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white/90">{products.length} live items</span>
                    <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800">{categoryLabel}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200/40">
                <Search className="text-rose-200" size={18} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search for cuts, farms, or tags"
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-white/50"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-semibold text-white">Categories (synced from Square)</div>
                    <p className="text-white/60 text-xs">Loaded from the categories on the products we receive.</p>
                  </div>
                  {selectedCategory && (
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(null)}
                      className="text-rose-200 hover:text-white text-xs font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid gap-2 max-h-[320px] overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect(null)}
                    className={`w-full text-left px-3 py-2 rounded-xl border transition ${
                      !selectedCategory
                        ? "bg-white text-black border-white"
                        : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                    }`}
                  >
                    All categories
                  </button>
                  {categories.map((category) => {
                    const isActive = category === selectedCategory;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategorySelect(category)}
                        className={`w-full text-left px-3 py-2 rounded-xl border transition ${
                          isActive
                            ? "bg-white text-black border-white"
                            : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="text-sm font-semibold text-white">Quick facts</div>
                <div className="grid grid-cols-2 gap-3 text-white/80 text-xs">
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-rose-200">Live items</div>
                    <div className="text-lg font-semibold text-white">{products.length}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-rose-200">Square categories</div>
                    <div className="text-lg font-semibold text-white">{categories.length || "-"}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-rose-200">Per page</div>
                    <div className="text-lg font-semibold text-white">{pageSize}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-rose-200">Pages</div>
                    <div className="text-lg font-semibold text-white">{totalPages}</div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white rounded-3xl border border-red-100 shadow-lg p-6">
                  <p className="text-red-500 uppercase tracking-[0.24em] text-xs mb-2">Popular this week</p>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold text-black">What customers reorder</h3>
                    <span className="text-sm text-gray-500">{products.length} items</span>
                  </div>
                  <div className="mt-3 space-y-3">
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
                </div>

                <div className="bg-gradient-to-br from-black via-[#0e0e12] to-[#16181d] text-white rounded-3xl border border-red-800/50 shadow-lg p-6 space-y-4">
                  <p className="text-red-300 uppercase tracking-[0.24em] text-xs">How we pack</p>
                  <h3 className="text-2xl font-semibold leading-tight">Butcher-cut, cold, and ready to cook.</h3>
                  <div className="space-y-3 text-white/80 text-sm">
                    {[
                      {
                        title: "Choose your section",
                        detail: "Jump straight to beef, sausages, seafood, or imports.",
                      },
                      { title: "Add exact cuts", detail: "See pricing first, then add to cart with one click." },
                      { title: "Delivery or pickup", detail: "Insulated liners, ice packs, next-day local delivery." },
                    ].map((step, index) => (
                      <div key={step.title} className="flex gap-3">
                        <span className="h-7 w-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-semibold">{step.title}</div>
                          <p className="text-white/70 text-sm">{step.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="bg-white text-black px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
                      onClick={() => handleCategorySelect("sausages")}
                    >
                      Shop sausages
                    </button>
                    <button
                      type="button"
                      className="border border-white/70 text-white px-4 py-2 rounded-xl hover:bg-white hover:text-black transition-colors"
                      onClick={() => handleCategorySelect("smoked fish")}
                    >
                      Smoked fish
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-white/80">
                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-700/70">
                      <Truck size={16} /> Next-day local delivery
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-700/70">
                      <Snowflake size={16} /> Cold-packed shipping
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-red-100 shadow-xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-[0.22em] text-red-600">Catalog</div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">{categoryLabel}</span>
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">{products.length} products</span>
                      {categories.length > 0 && (
                        <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                          {categories.length} categories
                        </span>
                      )}
                      {debouncedSearch && (
                        <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                          Search: "{debouncedSearch}"
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Per page</label>
                    <select
                      value={pageSize}
                      onChange={(event) => setPageSize(Number(event.target.value))}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm"
                    >
                      {PAGE_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <ProductGrid products={paginatedProducts} loading={loading} />

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="text-gray-600">
                    {products.length
                      ? `Showing ${showingStart}-${showingEnd} of ${products.length}`
                      : "No products match your filters yet."}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <div className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold">
                      Page {currentPage} of {totalPages}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MenuPage;
