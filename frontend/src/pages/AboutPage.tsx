import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, CheckCircle2, Drumstick, Leaf, ShieldCheck, Snowflake, Truck } from "lucide-react";
import heroMain from "../assets/hero-large-cuts.jpg";
import pastureImg from "../assets/full-cow.jpg";
import boardImg from "../assets/hero-menu.jpg";

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

const checklist = [
  "Paperwork-backed programs with clear labels and pack dates.",
  "Boxes that stay between 0–4°C with ice packs and insulated liners.",
  "Family-ready cuts without added hormones or shortcuts in the grind.",
];

function AboutPage() {
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
                  src={heroMain}
                  alt="Hand-cut steaks on butcher paper"
                  className="w-full h-[260px] md:h-[320px] object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[22px] overflow-hidden shadow-xl border border-white/60 bg-white">
                  <img src={pastureImg} alt="Cattle grazing on prairie grass" className="w-full h-44 object-cover" />
                </div>
                <div className="rounded-[22px] overflow-hidden shadow-xl border border-white/60 bg-white">
                  <img src={boardImg} alt="Butchered steaks ready to cook" className="w-full h-44 object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-white text-[#111827] py-12">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
          <div className="space-y-4">
            <p className="text-[#c22030] uppercase tracking-[0.2em] text-xs font-semibold">More than a box</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Small-batch cutting, cold-chain delivery, and paperwork you can keep.
            </h2>
            <p className="text-[#4b5563]">
              We still sign every sleeve, walk the farms, and build delivery routes around temperature. The goal: clear,
              honest labels that make families and chefs feel confident.
            </p>
            <div className="space-y-3">
              {checklist.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 bg-[#f8f5ee] border border-[#efe3d4] rounded-xl px-4 py-3"
                >
                  <CheckCircle2 className="text-[#c22030]" size={18} />
                  <span className="text-sm text-[#374151]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#efe3d4] bg-gradient-to-br from-[#fdfaf5] to-[#f4ede4] p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#c22030] mb-2">
                <Snowflake size={16} /> 0–4°C cold chain
              </div>
              <p className="text-[#374151] text-sm">
                Ice packs, insulated liners, and routed drop times keep each order inspection-ready when it arrives.
              </p>
            </div>
            <div className="rounded-2xl border border-[#efe3d4] bg-gradient-to-br from-[#fdfaf5] to-[#f4ede4] p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#c22030] mb-2">
                <Truck size={16} /> Built for delivery
              </div>
              <p className="text-[#374151] text-sm">
                Local delivery, pickup, and insulated shipping across provinces with labels that match the paperwork.
              </p>
            </div>
            <div className="rounded-2xl border border-[#efe3d4] bg-gradient-to-br from-[#fdfaf5] to-[#f4ede4] p-5 shadow-sm sm:col-span-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#c22030] mb-2">
                <BadgeCheck size={16} /> Transparent programs
              </div>
              <p className="text-[#374151] text-sm">
                Grass-fed, hormone-free, and European-inspired cuts with documentation and FAQs ready for anyone who
                wants to verify.
              </p>
              <Link
                to="/good-to-know"
                className="inline-flex items-center gap-2 mt-3 text-[#c22030] font-semibold hover:text-[#b01b2a]"
              >
                See inspection FAQ <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
