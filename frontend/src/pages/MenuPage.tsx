import { useEffect, useMemo, useRef, useState } from "react";
import { Drumstick, Fish, Flame, Search } from "lucide-react";
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
  const [inStockOnly, setInStockOnly] = useState(false);
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

  const filteredProducts = useMemo(() => {
    if (!inStockOnly) return products;

    return products.filter((product) => {
      const isInactive = product.is_active === false;
      const quantityRemaining = typeof product.square_quantity === "number" ? product.square_quantity : null;
      const isOutOfStock = isInactive || (quantityRemaining !== null && quantityRemaining <= 0);
      return !isOutOfStock;
    });
  }, [products, inStockOnly]);

  const productCount = filteredProducts.length;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(Math.max(productCount, 1) / pageSize)),
    [productCount, pageSize],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, inStockOnly, pageSize]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const showingStart = productCount ? (currentPage - 1) * pageSize + 1 : 0;
  const showingEnd = Math.min(productCount, currentPage * pageSize);

  const categoryLabel = selectedCategory || "All categories";

  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    scrollToCatalog();
  };

  const resultLabel = useMemo(() => {
    if (selectedCategory) {
      return inStockOnly ? `${categoryLabel} in stock` : `${categoryLabel} ready to ship`;
    }
    return inStockOnly ? "In stock only" : "All categories available";
  }, [selectedCategory, categoryLabel, inStockOnly]);

  return (
    <div className="landing-page space-y-0 bg-black text-white">
      <section className="landing-section bg-gradient-to-br from-[#0b0b12] via-[#1b0a10] to-[#0c1718] py-16 md:py-20 border-b border-red-900/50">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 lg:px-14 space-y-6">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-rose-200">
            <span className="hidden sm:block h-px w-10 bg-rose-200/60" />
            <span>Shop • Butcher Case</span>
          </div>
          <div className="space-y-5 max-w-4xl">
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
                to="/large-cuts"
                className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition-colors"
              >
                Large cuts & roasts
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
                { label: "Live items", value: productCount ? `${productCount}+` : "Ready" },
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
                <span className="px-3 py-1 rounded-full bg-black text-white">{productCount} items</span>
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
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-rose-200">Filters</p>
                <span className="text-[11px] text-white/70">{productCount} items</span>
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

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">In stock only</div>
                  <p className="text-xs text-white/60">Hide sold out or inactive items.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setInStockOnly((value) => !value)}
                  className={`px-3 py-2 rounded-xl border font-semibold text-sm transition ${
                    inStockOnly
                      ? "bg-white text-black border-white"
                      : "bg-white/5 text-white border-white/20 hover:bg-white/10"
                  }`}
                >
                  {inStockOnly ? "On" : "Off"}
                </button>
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

            </aside>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-red-100 shadow-xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-[0.22em] text-red-600">Catalog</div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">{categoryLabel}</span>
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">{productCount} products</span>
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
                    {productCount
                      ? `Showing ${showingStart}-${showingEnd} of ${productCount}`
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
