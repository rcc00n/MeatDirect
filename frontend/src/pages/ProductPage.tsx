import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getProduct, getProducts } from "../api/products";
import SimilarProductsRow from "../components/products/SimilarProductsRow";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";
import { getProductImageUrl } from "../utils/products";

type GalleryImage = {
  url: string;
  alt: string;
};

function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, clear } = useCart();
  const [product, setProduct] = useState<Product | undefined>();
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setProduct(undefined);
      return;
    }

    let active = true;
    setLoading(true);
    setProduct(undefined);
    setActiveImage(null);
    setQuantity(1);

    getProduct(slug)
      .then((result) => {
        if (!active) return;
        setProduct(result);
        setActiveImage(getProductImageUrl(result));
      })
      .catch(() => {
        if (!active) return;
        setProduct(undefined);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    getProducts()
      .then((products) => {
        if (!active) return;
        setCatalog(products);
      })
      .catch(() => {
        if (!active) return;
        setCatalog([]);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const galleryImages = useMemo<GalleryImage[]>(() => {
  if (!product) return [];
  const images: GalleryImage[] = product.images.map((image) => ({
    url: image.image_url,
    alt: image.alt_text || product.name,
  }));

    if (product.main_image_url && !images.some((image) => image.url === product.main_image_url)) {
      images.unshift({ url: product.main_image_url, alt: product.name });
    }

    if (product.image_url && !images.some((image) => image.url === product.image_url)) {
      images.unshift({ url: product.image_url, alt: product.name });
    }

    if (!images.length) {
      images.push({ url: getProductImageUrl(product), alt: product.name });
    }

    return images;
  }, [product]);

  const similarProducts = useMemo(() => {
    if (!product) return [] as Product[];
    return catalog.filter(
      (candidate) =>
        candidate.id !== product.id &&
        product.category &&
        candidate.category === product.category,
    );
  }, [catalog, product]);

  if (loading) {
    return <p style={{ color: "#475569" }}>Loading product...</p>;
  }

  if (!product) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <p style={{ color: "#475569" }}>Product not found.</p>
        <Link to="/">Back to catalog</Link>
      </div>
    );
  }

  const activeImageSrc = activeImage || getProductImageUrl(product);
  const quantityRemaining = typeof product.square_quantity === "number" ? product.square_quantity : null;
  const isInactive = product.is_active === false;
  const isOutOfStock = isInactive || (quantityRemaining !== null ? quantityRemaining <= 0 : false);

  const handleQuantityChange = (value: number) => {
    if (Number.isNaN(value)) return;
    setQuantity(Math.max(1, Math.floor(value)));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
  };

  const handlePayNow = () => {
    if (!product) return;
    clear();
    addItem(product, quantity);
    navigate("/checkout");
  };

  return (
    <div className="landing-section bg-gradient-to-b from-white to-red-50/30 text-black">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 space-y-8">
        <Link to="/" className="inline-flex items-center gap-2 text-red-600 font-semibold hover:underline">
          ← Back to catalog
        </Link>

        <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
          <div className="bg-white/95 border border-gray-200 rounded-3xl shadow-xl p-4 space-y-4">
            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={activeImageSrc}
                alt={product.name}
                className="w-full h-[420px] md:h-[520px] object-cover"
              />
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {galleryImages.map((image) => (
                <button
                  type="button"
                  key={image.url}
                  onClick={() => setActiveImage(image.url)}
                  className={`rounded-xl border ${
                    image.url === activeImageSrc ? "border-red-600 ring-2 ring-red-100" : "border-gray-200"
                  } overflow-hidden bg-white transition-colors`}
                >
                  <img
                    src={image.url}
                    alt={image.alt || product.name}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/95 rounded-3xl border-2 border-black shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold leading-tight">{product.name}</h1>
                <div className="flex gap-2 flex-wrap items-center">
                  {product.category && (
                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-sm">
                      {product.category}
                    </span>
                  )}
                  {product.is_popular && (
                    <span className="px-3 py-1 rounded-full bg-black text-white text-sm border border-red-600">
                      Popular pick
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Per unit</p>
                <p className="text-3xl font-semibold text-red-600">${(product.price_cents / 100).toFixed(2)}</p>
                <p className={`text-sm font-semibold ${isOutOfStock ? "text-red-600" : "text-emerald-600"}`}>
                  {isOutOfStock ? "Out of stock" : "In stock"}
                </p>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">
              {product.description || "Hand-trimmed, cold-packed, and ready for your next cook."}
            </p>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">Cold-packed shipping</span>
              <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">Local delivery</span>
              <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">Hormone-free partners</span>
            </div>

            <div className="grid sm:grid-cols-[0.9fr_1.1fr] gap-4 items-end">
              <div className="space-y-2">
                <label className="font-semibold text-sm text-gray-800">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => handleQuantityChange(Number(event.target.value))}
                  disabled={isOutOfStock}
                  className="w-full max-w-[150px] px-4 py-3 rounded-2xl border-2 border-black font-semibold focus:outline-none focus:ring-2 focus:ring-red-200 disabled:bg-gray-100"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`rounded-2xl px-4 py-3 font-semibold text-white shadow-lg transition-transform ${
                    isOutOfStock
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-600 to-red-700 hover:translate-y-[-2px]"
                  }`}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "Out of stock" : "Add to cart"}
                </button>
                <button
                  type="button"
                  onClick={handlePayNow}
                  className={`rounded-2xl px-4 py-3 font-semibold border-2 transition-transform ${
                    isOutOfStock
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-black bg-black text-white hover:translate-y-[-2px]"
                  }`}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "Unavailable" : "Checkout now"}
                </button>
              </div>
            </div>

            {isOutOfStock ? (
              <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-semibold">
                Out of Stock — we will restock soon.
              </div>
            ) : (
              <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700">
                Next overnight delivery cut-off is Sunday 8pm. Cold-packed with liners and ice.
              </div>
            )}
          </div>
        </div>

        <SimilarProductsRow products={similarProducts} />
      </div>
    </div>
  );
}

export default ProductPage;
