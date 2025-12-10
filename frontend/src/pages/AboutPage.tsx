import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Drumstick, Flame, Fish, Snowflake } from "lucide-react";

const pillars = [
  {
    title: "Farm-direct sourcing",
    description:
      "We hand-pick prairie partners, pay for the specs we publish, and keep batch sizes small to protect flavor.",
    icon: Drumstick,
  },
  {
    title: "Eastern European craft",
    description: "Old-world curing, smoke, and spice layered onto Alberta beef, bison, pork, and poultry.",
    icon: Flame,
  },
  {
    title: "Seafood & staples that fit",
    description: "Smoked fish, poultry, pantry add-ons, and ready-to-cook kits that round out the butcher case.",
    icon: Fish,
  },
];

const processSteps = [
  {
    title: "Sourcing without shortcuts",
    detail: "Mike walks herds, reviews feed plans, and aligns genetics before booking space in the plant.",
  },
  {
    title: "Cut, age, and label",
    detail: "Small-batch cutting, consistent aging windows, and hand-trimmed portions with clear spec notes.",
  },
  {
    title: "Paperwork travels with product",
    detail: "Lot tracking, pack dates, inspector sign-offs, and cold-chain logs printed and stored with each batch.",
  },
  {
    title: "Delivery built around temperature",
    detail: "Insulated liners, ice packs, next-day local delivery, and insulated shipping across provinces.",
  },
];

const founders = [
  {
    name: "Mike",
    role: "Co-founder • Sourcing & fabrication",
    summary: "Farm kid turned butcher who still walks pastures before signing partners.",
    bullets: [
      "Sets specs, aging windows, and marbling targets.",
      "Keeps fabrication room aligned with inspectors daily.",
      "Teaches customers how to cook undervalued cuts.",
    ],
  },
  {
    name: "Natalia",
    role: "Co-founder • Food safety & logistics",
    summary: "Supply-chain pro who runs the cold room, labels, and delivery routes.",
    bullets: [
      "Builds delivery windows that protect the cold chain.",
      "Translates inspection language into simple guides.",
      "Owns community programs and subscription boxes.",
    ],
  },
];

const programs = [
  {
    eyebrow: "Grass-fed program",
    title: "Pasture-first beef and bison with a natural finish.",
    bullets: [
      "Marbling without heavy grain finishing.",
      "Higher omega-3s and clean, mineral-rich flavor.",
      "Great for grills, meal prep, and athletes.",
    ],
    cta: { label: "Shop large cuts", to: "/large-cuts" },
  },
  {
    eyebrow: "Hormone-free promise",
    title: "No added growth hormones or routine stimulants across proteins.",
    bullets: [
      "Better-for-family cuts for weekly staples.",
      "Pairs with our clean spice blends for quick dinners.",
      "Backed by transparent paperwork and labels.",
    ],
    cta: { label: "Shop the menu", to: "/menu" },
  },
  {
    eyebrow: "Transparency first",
    title: "Labels that match inspection logs so restaurants and families know the source.",
    bullets: [
      "Pack date, lot, and farm group on every sleeve.",
      "Sanitation and temperature logs stored with batches.",
      "FAQ and education for anyone who wants to verify.",
    ],
    cta: { label: "Read FAQ", to: "/good-to-know" },
  },
];

const metrics = [
  { value: "48 hrs", label: "Avg order-to-door", note: "Local delivery windows" },
  { value: "2 programs", label: "Provincial + federal inspection", note: "Paperwork-ready daily" },
  { value: "40+ farms", label: "Visited in person", note: "Farm-direct sourcing" },
  { value: "0 added hormones", label: "Across our lineup", note: "Family-safe proteins" },
];

function AboutPage() {
  return (
    <div className="landing-page space-y-0">
      <section className="landing-section bg-gradient-to-br from-black via-red-950 to-black text-white py-16 border-b-2 border-red-600">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14">
          <div className="space-y-4 max-w-3xl">
            <p className="text-red-400 uppercase tracking-[0.2em] text-xs">About MeatDirect</p>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Prairie-born butchers, inspection-ready delivery.
            </h1>
            <p className="text-gray-300 max-w-2xl">
              MeatDirect is the honest butcher shop we wanted nearby: Eastern European craft, Alberta proteins, and
              paperwork that keeps every box accountable.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="border border-red-700 bg-white/5 text-white px-4 py-2 rounded-full text-sm">
                Provincial + federal inspection
              </span>
              <span className="border border-red-700 bg-white/5 text-white px-4 py-2 rounded-full text-sm">
                Grass-fed & hormone-free programs
              </span>
              <span className="border border-red-700 bg-white/5 text-white px-4 py-2 rounded-full text-sm">
                Local delivery & insulated shipping
              </span>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/menu"
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Shop the lineup
              </Link>
              <Link
                to="/good-to-know"
                className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition-colors"
              >
                Inspection FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-white text-black py-16">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-3">
              <p className="text-red-600 uppercase tracking-wider text-sm">Why we exist</p>
              <h2 className="text-4xl font-semibold leading-tight max-w-2xl">
                We make European-inspired, inspection-ready meat easy to trust.
              </h2>
              <p className="text-gray-600 max-w-2xl">
                Eastern European comfort food meets Alberta farms. We cut, age, and package small batches so families and
                restaurants get the flavor and paperwork they expect.
              </p>
            </div>
            <div className="bg-black text-white rounded-2xl p-6 shadow-lg border border-red-700/50 max-w-md space-y-2">
              <p className="text-red-400 uppercase tracking-[0.2em] text-xs">Shipping & pickup</p>
              <h3 className="text-2xl font-semibold">
                Local delivery next-day, insulated shipping cross-province.
              </h3>
              <p className="text-sm text-white/80">
                Boxes leave our cold room with liners, ice packs, and labeling that matches our inspection logs.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-semibold">0–4°C cold chain</span>
                <span className="border border-white/50 px-3 py-1 rounded-full text-xs font-semibold">Pickup or delivery</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-red-50/40 to-white p-6 shadow-sm"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-red-600 text-white">
                  <pillar.icon size={20} />
                </div>
                <h3 className="text-xl font-semibold mt-4 mb-2">{pillar.title}</h3>
                <p className="text-gray-700">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section bg-black text-white py-16 border-t-2 border-red-600">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <div className="space-y-5">
            <p className="text-red-400 uppercase tracking-[0.2em] text-xs">How we operate</p>
            <h2 className="text-4xl font-semibold leading-tight">Less guesswork. More labels and logged temperatures.</h2>
            <div className="space-y-4">
              {processSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 items-start bg-white/5 border border-red-900/60 rounded-2xl p-5"
                >
                  <div className="h-10 w-10 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-white text-lg">{step.title}</div>
                    <p className="text-sm text-gray-300 mb-0">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs">Hand-trimmed batches</span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs">Lot + pack date on label</span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs">Sanitation logs daily</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-red-600 rounded-3xl p-8 shadow-2xl border border-red-500/60 space-y-4">
              <p className="uppercase tracking-[0.18em] text-xs text-white/80">Inspection & education</p>
              <h3 className="text-3xl font-semibold leading-tight">
                Provincial + federal oversight without losing flavor.
              </h3>
              <p className="text-white/90">
                We keep paperwork simple and invite oversight because it protects the families and chefs we serve.
              </p>
              <div className="space-y-2">
                {[
                  "Daily sanitation checks and logged cold-chain data.",
                  "Labels that match the batch paperwork for restaurants.",
                  "Clear FAQ for anyone who wants to verify programs.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="text-white" size={18} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/good-to-know"
                className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Visit education page <ArrowRight size={16} />
              </Link>
            </div>

            <div className="bg-white text-black rounded-2xl p-6 border border-red-100 shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-red-600 uppercase tracking-[0.2em] text-xs">Cold chain</p>
                  <h4 className="text-xl font-semibold">
                    Insulated liners, ice packs, and routed delivery windows.
                  </h4>
                </div>
                <Snowflake className="text-red-600" size={32} />
              </div>
              <p className="text-gray-700">
                Every order leaves our cold room between 0–4°C and stays there through pickup or delivery.
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">Tracked vans</span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">Insulated shipping boxes</span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">Route planning by Natalia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-gradient-to-br from-red-50 via-white to-red-50 text-black py-16">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-3 max-w-2xl">
              <p className="text-red-600 uppercase tracking-wider text-sm">Founders</p>
              <h2 className="text-4xl font-semibold leading-tight">
                Hands-on owners who still pack boxes and sign every label.
              </h2>
              <p className="text-gray-700">
                MeatDirect is still run by its founders—no brokers or distant partners. We stay close to the cut room,
                delivery routes, and paperwork.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-semibold">Family-owned</span>
              <span className="border border-red-200 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                On-site daily
              </span>
              <span className="border border-red-200 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                European roots
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {founders.map((founder) => (
              <div
                key={founder.name}
                className="rounded-2xl bg-black text-white p-6 border border-red-700/60 shadow-xl space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white text-black flex items-center justify-center font-bold text-lg">
                    {founder.name[0]}
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{founder.name}</div>
                    <div className="text-sm text-white/70">{founder.role}</div>
                  </div>
                </div>
                <p className="text-white/85">{founder.summary}</p>
                <div className="space-y-2">
                  {founder.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-2 text-sm text-white/90">
                      <ArrowRight className="text-red-300" size={14} />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section bg-white text-black py-16">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <p className="text-red-600 uppercase tracking-wider text-sm">Programs & standards</p>
              <h2 className="text-4xl font-semibold leading-tight">
                Grass-fed, hormone-free, and labeled for accountability.
              </h2>
              <p className="text-gray-700 max-w-2xl">
                We keep flavor front and center while making sure every batch has the paperwork to back it up.
              </p>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700"
            >
              Read the extended articles <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program.eyebrow}
                className="relative overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-br from-white via-red-50/60 to-white p-6 shadow-sm"
              >
                <div className="absolute -right-10 -top-16 h-36 w-36 bg-red-100 rounded-full blur-3xl" />
                <div className="relative space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-red-600">{program.eyebrow}</p>
                  <h3 className="text-xl font-semibold">{program.title}</h3>
                  <ul className="space-y-2 text-gray-700 list-disc list-inside">
                    {program.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <Link
                    to={program.cta.to}
                    className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700"
                  >
                    {program.cta.label} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section bg-black text-white py-16 border-t-2 border-red-600">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <p className="text-red-400 uppercase tracking-[0.2em] text-xs">Proof points</p>
              <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Numbers that stay on the label.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/menu"
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Shop the menu
              </Link>
              <Link
                to="/contact"
                className="border border-white/30 text-white px-5 py-2 rounded-lg hover:border-white transition-colors"
              >
                Talk to the team
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-red-900/60 bg-white/5 px-4 py-5 shadow-lg"
              >
                <div className="text-3xl font-semibold text-white">{metric.value}</div>
                <div className="text-sm font-semibold text-gray-200">{metric.label}</div>
                <div className="text-xs text-gray-400 mt-1">{metric.note}</div>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-red-900/60 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-red-300 uppercase tracking-[0.2em] text-xs">Ready when you are</div>
              <p className="text-lg font-semibold text-white mb-0">
                Transparent sourcing, cold-packed delivery, and old-world flavor.
              </p>
              <p className="text-sm text-gray-300 mb-0">
                Tap into the shop, browse large cuts, or read the education page if you need the paperwork first.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/large-cuts"
                className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Large cuts
              </Link>
              <Link
                to="/good-to-know"
                className="border border-white/40 text-white px-4 py-2 rounded-lg font-semibold hover:border-white transition-colors"
              >
                See inspection details
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
