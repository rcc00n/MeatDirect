import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Drumstick,
  Leaf,
  ShieldCheck,
  Snowflake,
  Truck,
} from "lucide-react";
import aboutImage1 from "../assets/about_1.jpg";
import aboutImage2 from "../assets/about_2.jpg";
import aboutImage3 from "../assets/about_3.jpg";
import aboutImage4 from "../assets/about_4.jpg";
import aboutImage5 from "../assets/about_5.jpg";
import aboutStore1 from "../assets/about_store_1.png";
import aboutStore2 from "../assets/about_store_2.jpg";
import aboutStore3 from "../assets/about_store_3.jpg";

const featurePills = [
  { title: "European craft", icon: Drumstick },
  { title: "Farm direct", icon: Leaf },
  { title: "Fast delivery", icon: Truck },
  { title: "Certified", icon: ShieldCheck },
];

const proofPoints = [
  { value: "100%", label: "Traceable sources" },
  { value: "24hr", label: "Cold chain delivery" },
  { value: "2x", label: "Daily inspections" },
];

const gallerySlides = [
  { src: aboutImage1, alt: "About gallery image 1" },
  { src: aboutImage2, alt: "About gallery image 2" },
  { src: aboutImage3, alt: "About gallery image 3" },
  { src: aboutImage4, alt: "About gallery image 4" },
  { src: aboutImage5, alt: "About gallery image 5" },
];

const highlightPillars = [
  {
    title: "Farm-direct sourcing",
    description: "Grass-fed, hormone-free partners we visit in person and label on every pack.",
    icon: Leaf,
    image: aboutImage2,
    accent: "from-[#e7f2e9] to-[#f7fbf8]",
  },
  {
    title: "European craft",
    description: "Old-world smoke, spice, and aging layered onto prairie proteins.",
    icon: Drumstick,
    image: aboutImage3,
    accent: "from-[#fbe9ec] to-[#fff6f8]",
  },
  {
    title: "Ready-to-trust packaging",
    description: "Pack dates, lot numbers, and temp logs printed so you can verify fast.",
    icon: ShieldCheck,
    image: aboutImage4,
    accent: "from-[#e9f0f6] to-[#f7fbff]",
  },
];

const shippingOptions = [
  {
    title: "Next-day local delivery",
    detail: "Order by 2PM for tomorrow inside the city. Built around a 0–4°C route.",
    icon: Truck,
  },
  {
    title: "In-store pickup",
    detail: "Same-day pickup at our inspection-ready counter, Mon–Sat.",
    icon: ShieldCheck,
  },
  {
    title: "Insulated provincial shipping",
    detail: "Triple-layer liners and gel packs keep everything cold for 2–3 day delivery.",
    icon: Snowflake,
  },
];

const coldChain = [
  { title: "Packed cold", detail: "Sealed at 0–2°C with timestamp labels on each sleeve." },
  { title: "Insulated transit", detail: "Gel packs and liners maintain 0–4°C until handoff." },
  { title: "Delivered fresh", detail: "Temp indicator in every box; call us if it reads 5°C+." },
];

function AboutPage() {
  const [slide, setSlide] = useState(0);

  const handlePrev = () => {
    setSlide((prev) => (prev === 0 ? gallerySlides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSlide((prev) => (prev === gallerySlides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="landing-page">
      <section className="landing-section bg-gradient-to-br from-[#f5eee7] via-[#f7f1ea] to-[#efe6dd] text-[#1f2937] py-16">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c22030] text-white text-xs font-semibold shadow-md">
              <BadgeCheck size={14} /> About MeatDirect
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Prairie-born butchers, inspection-ready delivery.
              </h1>
              <p className="text-lg text-[#4b5563] max-w-2xl">
                MeatDirect is the first boxed butcher shop we've worked hands-in. Eastern European craft, prairie
                partners, and paperwork that keeps every box honest from source to table.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {featurePills.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-white/80 border border-[#e5d8c9] px-4 py-4 shadow-sm"
                  >
                    <div className="h-10 w-10 rounded-full bg-[#f8f1e8] flex items-center justify-center text-[#c22030] border border-white">
                      <Icon size={18} />
                    </div>
                    <div className="text-sm font-semibold text-center">{item.title}</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white/90 backdrop-blur-md border border-[#ebdfd0] rounded-2xl shadow-lg grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#f1e5d7]">
              {proofPoints.map((point) => (
                <div key={point.label} className="px-6 py-4 flex flex-col items-center text-center">
                  <div className="text-3xl font-bold text-[#c22030]">{point.value}</div>
                  <div className="text-sm font-semibold text-[#1f2937]">{point.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to="/menu"
                className="bg-[#c22030] text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-[#b01b2a] transition-colors"
              >
                Shop the fridge
              </Link>
              <Link
                to="/good-to-know"
                className="bg-white/80 text-[#1f2937] px-6 py-3 rounded-xl font-semibold border border-[#e5d8c9] hover:bg-white transition-colors"
              >
                I'll visit FAQ
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-[#6b7280]">
              <span className="px-3 py-1 rounded-full bg-white/70 border border-[#e8dbcd]">Local + insulated shipping</span>
              <span className="px-3 py-1 rounded-full bg-white/70 border border-[#e8dbcd]">Labels that match the lot</span>
              <span className="px-3 py-1 rounded-full bg-white/70 border border-[#e8dbcd]">0–4°C routes</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-2 -top-4 z-10 inline-flex items-center gap-2 bg-[#c22030] text-white px-4 py-2 rounded-full shadow-xl">
              <ShieldCheck size={16} />
              <span className="text-sm font-semibold">Certified</span>
            </div>
            <div className="space-y-4">
              <div className="rounded-[28px] overflow-hidden shadow-2xl border border-white/60 bg-white">
                <img
                  src={aboutStore1}
                  alt="MeatDirect storefront and team"
                  className="w-full h-[260px] md:h-[320px] object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[22px] overflow-hidden shadow-xl border border-white/60 bg-white">
                  <img src={aboutStore2} alt="Inside the MeatDirect shop" className="w-full h-44 object-cover" />
                </div>
                <div className="rounded-[22px] overflow-hidden shadow-xl border border-white/60 bg-white">
                  <img src={aboutStore3} alt="Cold case and counter at MeatDirect" className="w-full h-44 object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-white text-[#111827] py-12">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-flex px-4 py-2 rounded-full bg-[#f7e8eb] text-[#c22030] text-xs font-semibold tracking-wide">
              Our gallery
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">See the difference quality makes</h2>
            <p className="text-[#4b5563] max-w-2xl mx-auto text-sm md:text-base">
              From farm to table, every step is crafted with care and expertise.
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={handlePrev}
              className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white shadow-lg border border-[#ece4d9] items-center justify-center text-[#c22030] hover:-translate-x-0.5 transition-transform"
              aria-label="Previous slide"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white shadow-lg border border-[#ece4d9] items-center justify-center text-[#c22030] hover:translate-x-0.5 transition-transform"
              aria-label="Next slide"
            >
              <ArrowRight size={20} />
            </button>

            <div className="overflow-hidden rounded-[26px] border border-[#efe4d6] shadow-[0_24px_50px_-32px_rgba(15,23,42,0.28)]">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${slide * 100}%)` }}
              >
                {gallerySlides.map((item) => (
                  <div key={item.src} className="w-full shrink-0 px-2 sm:px-4 py-4 bg-white">
                    <div className="rounded-2xl overflow-hidden shadow-lg">
                      <img src={item.src} alt={item.alt} className="w-full h-[260px] md:h-[360px] object-cover" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-4">
              {gallerySlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    slide === index ? "w-6 bg-[#c22030]" : "w-2.5 bg-[#d6cec3]"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-gradient-to-br from-[#f7f1ea] via-white to-[#f7f1ea] text-[#111827] py-12">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-flex px-4 py-2 rounded-full bg-white shadow-sm border border-[#e8ddd0] text-xs font-semibold tracking-wide text-[#c22030]">
              Why we exist
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
              We make European-inspired, inspection-ready meat easy to trust.
            </h2>
            <p className="text-[#4b5563] max-w-2xl mx-auto text-sm md:text-base">
              Built on traditional craft, modern safety standards, and simple transparency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {highlightPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${pillar.accent} border border-[#ebe0d2] shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)]`}
                >
                  <div className="p-6 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow-sm border border-[#e8ddd0]">
                      <Icon size={18} className="text-[#c22030]" />
                      <span className="text-sm font-semibold">{pillar.title}</span>
                    </div>
                    <p className="text-[#374151] text-sm leading-relaxed">{pillar.description}</p>
                    <div className="flex items-center gap-2 text-[#6b7280] text-sm">
                      <CheckCircle2 size={16} className="text-[#c22030]" />
                      <span>Traceable, cold-chain labeled, and signed.</span>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <div className="rounded-2xl overflow-hidden border border-white shadow-md">
                      <img src={pillar.image} alt={pillar.title} className="w-full h-48 object-cover" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="landing-section bg-white text-[#111827] py-12">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
          <div className="space-y-4">
            <p className="text-[#c22030] uppercase tracking-[0.2em] text-xs font-semibold">Shipping & pickup</p>
            <h3 className="text-3xl md:text-4xl font-bold leading-tight">
              Local delivery next-day, insulated shipping cross-province.
            </h3>
            <p className="text-[#4b5563]">
              Choose what fits: routed local drops, quick pickup, or insulated shipping. Every option is built around
              cold-chain care.
            </p>

            <div className="space-y-3">
              {shippingOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.title}
                    className="flex items-start gap-3 rounded-2xl bg-[#f8f5ee] border border-[#efe4d6] px-4 py-3 shadow-sm"
                  >
                    <div className="h-10 w-10 rounded-xl bg-white border border-[#e8ddd0] flex items-center justify-center text-[#c22030] shadow-sm">
                      <Icon size={18} />
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-lg">{option.title}</div>
                      <p className="text-sm text-[#4b5563] mb-0">{option.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-3xl bg-gradient-to-br from-[#111827] to-[#1f2937] text-white p-6 shadow-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-[#f3d6dc] font-semibold">How we operate</p>
              <h4 className="text-2xl font-semibold leading-tight mt-2 mb-3">
                Less guesswork. More labels and logged temperatures.
              </h4>
              <div className="space-y-3">
                {coldChain.map((item, index) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
                  >
                    <div className="h-10 w-10 rounded-full bg-[#c22030] text-white flex items-center justify-center font-semibold">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">{item.title}</div>
                      <p className="text-xs text-white/80 mb-0">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#efe4d6] bg-[#fdf7f2] p-5 shadow-sm space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-[#c22030] font-semibold">Transparency first</p>
              <p className="text-sm text-[#374151]">
                Labels match the paperwork—lot, pack date, and temp logs. Ask for proof anytime.
              </p>
              <Link
                to="/good-to-know"
                className="inline-flex items-center gap-2 text-[#c22030] font-semibold hover:text-[#b01b2a]"
              >
                View inspection FAQ <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-gradient-to-r from-[#c22030] to-[#ad1b2b] text-white py-12">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="uppercase tracking-[0.2em] text-xs text-white/80 font-semibold">Ready to trust your meat</p>
            <h3 className="text-2xl md:text-3xl font-extrabold leading-snug">
              Inspection-ready cuts with transparent sourcing.
            </h3>
            <p className="text-white/80 text-sm md:text-base max-w-2xl">
              Every program is paperwork-backed: grass-fed, hormone-free, and labeled so you can verify fast.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/menu"
              className="bg-white text-[#c22030] px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-[#fff3f5] transition-colors"
            >
              Shop the fridge
            </Link>
            <Link
              to="/good-to-know"
              className="border border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              View certifications
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
