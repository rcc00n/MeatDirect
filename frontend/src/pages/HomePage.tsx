import { useEffect, useMemo, useState } from "react";

import { getProducts } from "../api/products";
import FiltersBar from "../components/products/FiltersBar";
import ProductGrid from "../components/products/ProductGrid";
import SearchBar from "../components/products/SearchBar";
import type { Product } from "../types";

function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getProducts(debouncedSearch || undefined, controller.signal)
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
  }, [debouncedSearch]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.category).filter((category): category is string => Boolean(category))),
      ),
    [products],
  );

  useEffect(() => {
    if (selectedCategory && !categories.includes(selectedCategory)) {
      setSelectedCategory(null);
    }
  }, [categories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    const matchesCategory = selectedCategory
      ? products.filter((product) => product.category === selectedCategory)
      : products;

    return [...matchesCategory].sort((a, b) => Number(b.is_popular) - Number(a.is_popular));
  }, [products, selectedCategory]);

  const popularProducts = useMemo(() => products.filter((product) => product.is_popular).slice(0, 3), [products]);
  const categoryBadges = categories.slice(0, 4);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section
        style={{
          padding: "20px 22px",
          borderRadius: 20,
          background: "linear-gradient(135deg, #fff7ed, #f0f9ff)",
          border: "1px solid #e2e8f0",
          boxShadow: "0 22px 48px -32px rgba(15, 23, 42, 0.3)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18, alignItems: "center" }}>
          <div style={{ display: "grid", gap: 10 }}>
            <span style={{ color: "#c2410c", fontWeight: 700, letterSpacing: 0.4 }}>
              POPULAR PRODUCTS · {products.length} items
            </span>
            <h1 style={{ margin: 0, fontSize: 32 }}>Chef-grade meat, shipped fresh to you</h1>
            <p style={{ margin: 0, color: "#475569" }}>
              Search the catalog, filter by category, and spot the picks our shoppers love. Everything comes trimmed and
              ready for the grill or pan.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categoryBadges.length ? (
                categoryBadges.map((category) => (
                  <span
                    key={category}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    {category}
                  </span>
                ))
              ) : (
                <span style={{ color: "#475569" }}>Add categories from admin to highlight them here.</span>
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 16,
              background: "#fff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 16px 32px -24px rgba(15, 23, 42, 0.18)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "grid", gap: 4 }}>
                <span style={{ color: "#0ea5e9", fontWeight: 700, fontSize: 12, letterSpacing: 0.3 }}>
                  Popular right now
                </span>
                <strong style={{ fontSize: 18 }}>Shoppers are adding</strong>
              </div>
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "#ecfdf3",
                  border: "1px solid #bbf7d0",
                  color: "#166534",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                Fresh drop
              </span>
            </div>
            {popularProducts.length ? (
              <div style={{ display: "grid", gap: 8 }}>
                {popularProducts.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: 12,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{product.name}</span>
                    <span style={{ color: "#0ea5e9", fontWeight: 700 }}>${(product.price_cents / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: "#475569" }}>Mark a product as popular in admin to feature it here.</p>
            )}
          </div>
        </div>
      </section>

      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      <FiltersBar categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
      {error && (
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}>
          {error}
        </div>
      )}
      <ProductGrid products={filteredProducts} loading={loading} />
    </div>
  );
}

export default HomePage;
