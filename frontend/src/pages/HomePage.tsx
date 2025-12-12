import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Drumstick, Fish, Flame } from "lucide-react";

import { getProducts } from "../api/products";
import heroBackdrop from "../assets/hero-large-cuts.jpg";
import quarterCowImage from "../assets/quarter-cow.jpg";
import halfCowImage from "../assets/half-cow.jpg";
import wholeCowImage from "../assets/full-cow.jpg";
import homePageEuropean from "../assets/home_page_European.png";
import orderOnlinePng from "../assets/icons/order-online.png";
import shopLocalProductsPng from "../assets/icons/shop-local-products.png";
import shopPickupPng from "../assets/icons/shop-pickup.png";
import shopShippingPng from "../assets/icons/shop-shipping.png";
import { CategoryCard } from "../components/CategoryCard";
import { FeatureCard } from "../components/FeatureCard";
import { ProductCard } from "../components/ProductCard";
import { ServiceCard } from "../components/ServiceCard";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";
import { getProductImageUrl } from "../utils/products";

const formatPrice = (priceCents: number) => `$${(priceCents / 100).toFixed(2)}`;

const categoryShowcase = [
  {
    title: "Meat",
    image:
      "https://images.unsplash.com/photo-1677607219966-22fbfa433667?auto=format&fit=crop&w=1200&q=80",
    links: ["Bison", "Beef", "Lamb", "Pork"],
    description:
      "From Beef to Bison, from Pork to Poultry, Meat Direct offers amazing cuts sourced from farms around Alberta.",
  },
  {
    title: "Poultry",
    image:
      "https://images.unsplash.com/photo-1759493321741-883fbf9f433c?auto=format&fit=crop&w=1200&q=80",
    links: ["Chicken Breasts", "Wings", "Thighs", "Drums"],
    description:
      "We carry a full line of farm-fresh poultry, including ground chicken, turkey, garlic sausage, breasts, and more.",
  },
  {
    title: "Sausages",
    image:
      "https://images.unsplash.com/photo-1662233726525-21a6de41c089?auto=format&fit=crop&w=1200&q=80",
    links: ["Pepperoni", "Rings", "Beef Smokies", "Cheddar"],
    description: "Every product is handcrafted using carefully sourced ingredients and slow smoked for depth.",
  },
  {
    title: "Smoked Fish",
    image:
      "https://images.unsplash.com/photo-1546970361-407ddc8053fc?auto=format&fit=crop&w=1200&q=80",
    links: ["Salmon", "Mackerel", "Cod", "Herring"],
    description: "Our shop offers a wide variety of dried, smoked, and salted fish to suit every taste.",
  },
];

const featureHighlights = [
  { title: "Genetics", description: "Closed herd genetics that promote flavor" },
  { title: "Chemical Free", description: "No growth hormones, antibiotics, or GMOs" },
  { title: "Humanely Harvested", description: "Low-stress harvest in a clean plant" },
  { title: "Farm Inspected", description: "USDA inspected and hand-inspected on farm" },
  { title: "Slow Raised", description: "Raised slow to develop rich cuts" },
];

const shoppingIconSpotlight = [
  {
    title: "Order online",
    description: "Full digital catalog with live availability and transparent pricing.",
    image: orderOnlinePng,
  },
  {
    title: "Local & clean",
    description: "Prairie farms, clean labels, and traceable partners for every cut.",
    image: shopLocalProductsPng,
  },
  {
    title: "Visit the shop",
    description: "Pop into the market for deli favorites, pantry finds, and butcher picks.",
    image: shopPickupPng,
  },
  {
    title: "Fast delivery",
    description: "Cold-packed vans running frequent routes so your box arrives chilled.",
    image: shopShippingPng,
  },
];

const cowPackages = [
  {
    title: "Quarter Cow",
    price: "$249.88 Deposit",
    image: quarterCowImage,
  },
  {
    title: "Half Cow",
    price: "$499.75 Deposit",
    image: halfCowImage,
  },
  {
    title: "Whole Cow",
    price: "$999.50 Deposit",
    image: wholeCowImage,
  },
];

const productHighlights = [
  {
    name: "Grass-fed Beef",
    description: "Pasture-raised sides, curated steaks, and butcher-favorite roasts.",
    icon: Drumstick,
  },
  {
    name: "Smoked & Cured",
    description: "European-style sausages, pepperoni sticks, and slow-smoked specialties.",
    icon: Flame,
  },
  {
    name: "Seafood & Poultry",
    description: "Fresh poultry staples plus smoked fish for boards and quick dinners.",
    icon: Fish,
  },
];

const EUROPEAN_CATEGORY = "Eurogrocer";
const europeanCountryBadges = ["Ukraine", "Poland", "Lithuania", "Latvia"];

function HomePage() {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const shopSectionRef = useRef<HTMLDivElement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getProducts(undefined, controller.signal)
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
  }, []);

  const popularProducts = useMemo(
    () => products.filter((product) => product.is_popular).slice(0, 4),
    [products],
  );

  const shopHighlights = useMemo(() => (products.length ? products.slice(0, 4) : []), [products]);

  const scrollToShop = () => {
    shopSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddToCart = (product: Product) => addItem(product, 1);
  const isOutOfStock = (product: Product) =>
    product.is_active === false || (typeof product.square_quantity === "number" && product.square_quantity <= 0);

  return (
    <div className="landing-page space-y-0 text-white">
      <section className="landing-section hero-banner py-16 border-b-2 border-red-600">
        <div
          className="hero-banner__media"
          style={{ backgroundImage: `url(${heroBackdrop})` }}
          aria-hidden
        />
        <div className="hero-banner__content w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <p className="text-red-300 uppercase tracking-[0.2em] text-xs">Great Tasting Meats • Hormone Free</p>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">We specialize in high quality, local meat.</h1>
            <p className="text-gray-200 max-w-xl">
              Beef, chicken, lamb, and pork—raised for the butcher and delivered to your door. No hormones or antibiotics
              for a healthier lifestyle.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={scrollToShop}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Shop Now
              </button>
              <Link
                to="/large-cuts"
                className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition-colors"
              >
                Large cuts & roasts
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryShowcase.slice(0, 3).map((item) => (
                <span key={item.title} className="border border-white/60 bg-black/30 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                  {item.title}
                </span>
              ))}
            </div>
          </div>

          <div className="hero-banner__panel bg-white/90 backdrop-blur-lg text-black p-8 rounded-2xl shadow-2xl border border-white/70">
            <p className="text-red-600 uppercase tracking-wider mb-2 text-sm">Popular Right Now</p>
            <h3 className="text-2xl font-semibold mb-4">What locals are adding</h3>
            <div className="space-y-3">
              {popularProducts.length ? (
                popularProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border-b last:border-b-0 border-gray-200/70 pb-3"
                  >
                    <div>
                      <div className="font-semibold text-black">{product.name}</div>
                      {product.category && <div className="text-xs text-gray-500">{product.category}</div>}
                    </div>
                    <div className="text-red-600 font-semibold">{formatPrice(product.price_cents)}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">
                  {loading ? "Loading top picks..." : "Mark products as popular in admin to feature them here."}
                </p>
              )}
            </div>
            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
            <button
              type="button"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors w-full mt-6"
              onClick={scrollToShop}
            >
              Shop the lineup
            </button>
          </div>
        </div>
      </section>

      <section className="landing-section hidden md:block py-16 bg-black text-white border-t-2 border-red-600 border-b border-red-700/40">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-10">
          <div className="text-center space-y-3 max-w-4xl mx-auto">
            <p className="text-red-400 uppercase tracking-[0.22em] text-xs">Pick your flow</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-white">Choose how MeatDirect fits your day.</h2>
            <p className="text-gray-200">
              Bold, full-size icons so you can quickly spot the way you like to shop—online, local-first, in-store, or
              delivered.
            </p>
          </div>
          <div className="relative">
            <div className="relative">
              <div className="grid justify-items-center gap-6 sm:gap-8 xl:gap-10 sm:grid-cols-2 xl:grid-cols-4">
                {shoppingIconSpotlight.map((item) => (
                  <div
                    key={item.title}
                    className="flex flex-col items-center text-center gap-4 bg-white border border-[#ebe4d9] rounded-3xl p-6 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.55)] w-full max-w-[320px]"
                  >
                    <div className="h-24 w-24 rounded-3xl bg-[#fff1f1] flex items-center justify-center shadow-[0_22px_52px_-32px_rgba(220,38,38,0.8)]">
                      <picture className="h-20 w-20 flex items-center justify-center">
                        <source srcSet={item.image} type="image/png" />
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                    </div>
                    <div className="space-y-2 max-w-[260px]">
                      <h3 className="text-lg font-semibold text-[#1f150d]">{item.title}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="landing-section py-16 bg-white text-black border-t-2 border-red-600">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14">
          <div className="grid md:grid-cols-3 gap-8">
            {cowPackages.map((pkg) => (
              <div key={pkg.title} className="text-center bg-gray-50 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 h-48 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
                  <img src={pkg.image} alt={pkg.title} className="h-full max-w-full object-contain" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">{pkg.title}</h3>
                <p className="text-red-600 font-semibold mb-4">{pkg.price}</p>
                <button
                  type="button"
                  onClick={scrollToShop}
                  className="bg-black text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors text-sm"
                >
                  Add to cart
                </button>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/large-cuts"
              className="inline-block border-2 border-black text-black px-8 py-3 rounded hover:bg-black hover:text-white transition-colors"
            >
              View Large Cuts →
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-section py-16 bg-red-600">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-8">
          <div className="flex gap-8 flex-wrap">
            {categoryShowcase.map((category) => (
              <CategoryCard key={category.title} {...category} />
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section py-16 bg-[#f8f4ed] text-[#1f150d] border-t-2 border-red-600">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-red-700">
              <span className="h-10 w-[3px] rounded-full bg-red-500" />
              <span>From Europe to your table</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold leading-tight text-[#24150c]">
              European delicacies without hopping a flight.
            </h2>
            <p className="text-lg text-[#3c2717]">
              In our store you can find a diverse selection of Eastern European delicacies, with a particular focus on
              the finest products from Ukraine, Poland, Lithuania, and Latvia.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(`/menu?category=${encodeURIComponent(EUROPEAN_CATEGORY)}#shop`)}
                className="bg-red-600 text-white px-7 py-3 rounded-xl hover:bg-red-700 transition-colors shadow-[0_16px_36px_-26px_rgba(185,28,28,0.9)]"
              >
                Shop European now
              </button>
              <Link
                to="/menu#shop"
                className="border-2 border-[#2a1a0f] text-[#2a1a0f] px-7 py-3 rounded-xl hover:bg-[#2a1a0f] hover:text-white transition-colors"
              >
                Browse all
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-[#3c2717]">
              {europeanCountryBadges.map((country) => (
                <span
                  key={country}
                  className="px-3 py-2 rounded-full bg-white border border-[#e8dbcc] shadow-sm"
                >
                  {country}
                </span>
              ))}
              <span className="px-3 py-2 rounded-full bg-red-50 border border-red-100 text-red-700">
                Kvass • Sweets • Pantry
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-red-200/60 blur-3xl rounded-full" aria-hidden />
            <div className="relative bg-white rounded-3xl border border-[#f1e6d8] shadow-[0_32px_80px_-48px_rgba(0,0,0,0.55)] overflow-hidden">
              <img
                src={homePageEuropean}
                alt="Imported European sweets and pantry staples"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section py-16 bg-white text-black">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <p className="text-red-600 uppercase tracking-wider text-sm">About MeatDirect</p>
            <h2 className="text-4xl font-semibold">
              Our roots are in Eastern Europe, our farms are around the corner.
            </h2>
            <p className="text-gray-700">
              We provide an alternative to factory farms. We hand select partners that are sustainable, trim each cut by
              hand, and pack cold for delivery.
            </p>
            <p className="text-gray-700">
              Every cut is expertly trimmed and packaged in the traditional method to preserve flavor. Pasture-raised
              beef and pork, and free-range poultry are standard here.
            </p>
            <Link
              to="/about-us"
              className="text-red-600 border-2 border-red-600 px-6 py-3 inline-flex rounded-lg hover:bg-red-600 hover:text-white transition-colors w-fit"
            >
              Read our story →
            </Link>
          </div>
          <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-lg space-y-4">
            <p className="text-red-500 uppercase tracking-wider text-sm">Customer Story</p>
            <p className="text-xl leading-relaxed">
              "Time and price point-to-order and next day faster than the brick store. The price and quality set it
              apart. I haven't had more varied delivery."
            </p>
            <p className="text-gray-400">- Tracy L., happy meat box subscriber</p>
          </div>
        </div>
      </section>

      <section className="landing-section py-16 bg-black border-t-2 border-red-600">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
            <div>
              <p className="text-red-500 uppercase tracking-wider text-sm mb-2">Why Choose Us</p>
              <h2 className="text-4xl font-semibold">Standards that stay on the label.</h2>
            </div>
            <p className="text-gray-400 max-w-md">
              Farm-direct sourcing, small-batch cutting, and transparent partners you can trust.
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {featureHighlights.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section py-16 bg-white text-black" ref={shopSectionRef} id="shop">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <p className="text-red-600 uppercase tracking-wider text-sm">Shop • Menu</p>
              <h2 className="text-4xl font-semibold">Explore the full case.</h2>
              <p className="text-gray-600 mt-2">
                Find the cut you've been craving or pick an origin country, then view the products available.
              </p>
            </div>
            <Link to="/menu" className="text-red-600 font-semibold hover:underline flex items-center gap-2">
              Visit Shop <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {productHighlights.map((item) => (
              <ProductCard
                key={item.name}
                {...item}
                ctaLabel="View cuts"
                onClick={() => navigate("/menu")}
              />
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {loading && !shopHighlights.length ? (
              <div className="md:col-span-2 text-gray-600">Loading products...</div>
            ) : shopHighlights.length ? (
              shopHighlights.map((product) => (
                <ServiceCard
                  key={product.id}
                  title={product.name}
                  price={formatPrice(product.price_cents)}
                  description={product.description || product.category || "Popular pick from our shop."}
                  image={getProductImageUrl(product)}
                  onAddToCart={() => handleAddToCart(product)}
                  disabled={isOutOfStock(product)}
                  statusText={isOutOfStock(product) ? "Out of Stock" : undefined}
                  onDetails={() => navigate(`/products/${product.slug}`)}
                />
              ))
            ) : (
              <div className="md:col-span-2 text-gray-700 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6">
                <p className="font-semibold text-black">No products yet.</p>
                <p className="text-sm mt-2">Add items in the admin to see them featured here.</p>
              </div>
            )}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
