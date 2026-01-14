import { FormEvent, useState } from "react";
import { ArrowRight, Clock3, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Truck } from "lucide-react";

import { submitContactMessage } from "../api/contact";

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const hours = [
  { day: "Monday", time: "9a–6p" },
  { day: "Tuesday", time: "9a–6p" },
  { day: "Wednesday", time: "9a–6p" },
  { day: "Thursday", time: "9a–6p" },
  { day: "Friday", time: "9a–6p" },
  { day: "Saturday", time: "8a–4p" },
  { day: "Sunday", time: "Closed" },
];

function ContactPage() {
  const [formValues, setFormValues] = useState<ContactFormState>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (key: keyof ContactFormState, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormStatus("idle");
    setFormError(null);

    try {
      await submitContactMessage({
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),
        message: formValues.message.trim(),
      });
      setFormStatus("success");
      setFormValues({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Failed to submit contact message", error);
      setFormError("We couldn't send your message right now. Please call if it's urgent.");
      setFormStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="landing-page space-y-0 bg-black text-white">
      <section className="landing-section bg-gradient-to-br from-black via-red-950 to-black py-16 border-b-2 border-red-600">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-start">
          <div className="space-y-5">
            <p className="text-red-400 uppercase tracking-[0.2em] text-xs">Contact the shop</p>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">Talk directly to the MeatDirect team.</h1>
            <p className="text-gray-300 max-w-2xl">
              General questions, special cuts, delivery windows, or paperwork—reach out and a butcher will respond the
              same day during shop hours.
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="border border-gray-800 px-4 py-2 rounded-full text-gray-200">Same-day replies</span>
              <span className="border border-gray-800 px-4 py-2 rounded-full text-gray-200">Delivery & pickup updates</span>
              <span className="bg-red-600 px-4 py-2 rounded-full">Special orders & trims</span>
              <span className="border border-gray-800 px-4 py-2 rounded-full text-gray-200">Wholesale questions</span>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <a className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors" href="#contact-form">
                Send a message
              </a>
              <a
                className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition-colors"
                href="tel:+15874056328"
              >
                Call the shop
              </a>
              <a className="flex items-center gap-2 text-red-200 hover:text-white transition-colors" href="#visit">
                Plan a visit <ArrowRight size={18} />
              </a>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 pt-4">
              {[
                { label: "Response time", value: "Same business day" },
                { label: "Pickup", value: "Cleveland, OH" },
                { label: "Delivery", value: "Next-day local" },
              ].map((stat) => (
                <div key={stat.label} className="border border-red-900 bg-white/5 rounded-xl p-3">
                  <div className="text-sm text-gray-300">{stat.label}</div>
                  <div className="text-xl font-semibold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white text-black rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
            <div className="p-6 space-y-2 border-b border-gray-200">
              <p className="text-red-600 uppercase tracking-wider text-xs">Ways to reach us</p>
              <h3 className="text-2xl font-semibold">Direct line to the counter.</h3>
              <p className="text-gray-600">Call, text, or email and the butcher on duty will guide you.</p>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="flex items-start justify-between gap-4 p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-red-50 text-red-700 p-2 rounded-lg">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Call or text</p>
                    <a className="text-xl font-semibold text-black block" href="tel:+15874056328">
                      (587) 405-6328
                    </a>
                    <p className="text-sm text-gray-600">Live help during shop hours.</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">Live help</span>
              </div>

              <div className="flex items-start justify-between gap-4 p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 text-gray-800 p-2 rounded-lg">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Email</p>
                    <a className="text-lg font-semibold text-black block" href="mailto:info@meatdirectinc.ca">
                      info@meatdirectinc.ca
                    </a>
                    <p className="text-sm text-gray-600">Paperwork, invoices, and cut sheets welcomed.</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-gray-900 text-white text-sm font-semibold">Same-day</span>
              </div>

              <div className="flex items-start justify-between gap-4 p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-900 text-white p-2 rounded-lg">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Visit</p>
                    <div className="text-lg font-semibold text-black">1420 Meadow Lane, Suite B</div>
                    <p className="text-sm text-gray-600">Cleveland, OH 44113 · East side pickup door</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-600 text-white text-sm font-semibold">Easy pickup</span>
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-gray-600">Need wholesale or paperwork? Email the team and we will route it.</div>
              <a className="text-red-600 font-semibold flex items-center gap-2 hover:text-red-700" href="mailto:info@meatdirectinc.ca">
                Send email <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section py-16 bg-white text-black" id="visit">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <p className="text-red-600 uppercase tracking-wider text-sm">Visit & hours</p>
              <h2 className="text-4xl font-semibold">Plan your pickup or walk-in visit.</h2>
              <p className="text-gray-600 mt-2">
                Stop in for counter cuts, pick up a web order, or call from the loading zone and we will run it out.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-black text-white">Cleveland, OH</span>
              <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">Pickup friendly</span>
              <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">Insulated vans</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 shadow-lg space-y-6">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 flex gap-3">
                  <div className="bg-red-50 text-red-700 p-2 rounded-lg h-fit">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Address</p>
                    <p className="text-lg font-semibold text-black">1420 Meadow Lane, Suite B</p>
                    <p className="text-gray-600">Cleveland, OH 44113</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 flex gap-3">
                  <div className="bg-gray-100 text-gray-900 p-2 rounded-lg h-fit">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Phone</p>
                    <a className="text-lg font-semibold text-black block" href="tel:+15874056328">
                      (587) 405-6328
                    </a>
                    <p className="text-gray-600">Call ahead for special trims.</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 flex gap-3 sm:col-span-2">
                  <div className="bg-black text-white p-2 rounded-lg h-fit">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Email</p>
                    <a className="text-lg font-semibold text-black block" href="mailto:info@meatdirectinc.ca">
                      info@meatdirectinc.ca
                    </a>
                    <p className="text-gray-600">Invoices, COAs, ingredient lists, and delivery paperwork.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
                <p className="text-sm text-gray-600">Walk in for:</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">Fresh steaks & roasts</span>
                  <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">European deli & sausages</span>
                  <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">Smoked fish</span>
                  <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">Freezer bundles</span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-900 text-white p-5 shadow-inner space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-red-400 uppercase tracking-[0.2em] text-xs">Hours</p>
                    <h3 className="text-xl font-semibold">Shop schedule</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold">Same-day replies</span>
                </div>
                <ul className="divide-y divide-white/10">
                  {hours.map((entry) => (
                    <li key={entry.day} className="flex items-center justify-between py-2 text-sm">
                      <span>{entry.day}</span>
                      <span className="font-semibold">{entry.time}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-gray-300 text-sm">Closed most long weekends—call ahead before heading over.</p>
              </div>
            </div>

            <div className="bg-black rounded-3xl border border-red-700 shadow-2xl overflow-hidden">
              <div className="p-6 space-y-3">
                <p className="text-red-400 uppercase tracking-[0.2em] text-xs">Map</p>
                <h3 className="text-2xl font-semibold text-white">Easy parking and loading.</h3>
                <p className="text-gray-300">
                  Located just off Meadow Lane with parking by the east door. Call when you arrive and we will bring
                  orders out for quick pickup.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-red-600 text-white text-sm">Call on arrival</span>
                  <span className="px-3 py-1 rounded-full bg-white text-black text-sm">Delivery vans</span>
                  <span className="px-3 py-1 rounded-full bg-red-950 text-red-100 text-sm">Freezer packs ready</span>
                </div>
              </div>
              <div className="aspect-[4/3] bg-black">
                <iframe
                  title="Meat Direct location"
                  src="https://www.google.com/maps?q=1420+Meadow+Lane,+Cleveland,+OH+44113&output=embed"
                  allowFullScreen
                  loading="lazy"
                  className="w-full h-full border-0"
                />
              </div>
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-red-800 bg-red-950/60 text-red-50">
                <div className="p-4 flex gap-3">
                  <Truck className="text-red-200" size={18} />
                  <div>
                    <div className="font-semibold text-white">Delivery routes</div>
                    <p className="text-sm text-red-100">Insulated vans with cold packs. Scheduled windows available.</p>
                  </div>
                </div>
                <div className="p-4 flex gap-3">
                  <Clock3 className="text-red-200" size={18} />
                  <div>
                    <div className="font-semibold text-white">Pickup windows</div>
                    <p className="text-sm text-red-100">Call ahead and we will stage the order for you.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section py-16 bg-black text-white" id="contact-form">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div className="space-y-5">
            <p className="text-red-400 uppercase tracking-[0.2em] text-xs">Message the team</p>
            <h2 className="text-4xl font-semibold">Tell us what you need and we will confirm details.</h2>
            <p className="text-gray-300 max-w-xl">
              We monitor this inbox during posted hours. Include cut sizes, quantities, or delivery timing for faster replies.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Certificates & paperwork",
                  detail: "COAs, labels, allergen sheets, and sourcing details on request.",
                },
                {
                  icon: Truck,
                  title: "Delivery updates",
                  detail: "Route windows, cold-pack instructions, and order tracking.",
                },
                {
                  icon: MessageCircle,
                  title: "Special cuts",
                  detail: "Custom trim, freezer bundles, and event orders.",
                },
                {
                  icon: Clock3,
                  title: "Rush orders",
                  detail: "Call first, then send details so we can confirm availability.",
                },
              ].map((item) => (
                <div key={item.title} className="border border-red-900 bg-white/5 rounded-2xl p-4 flex gap-3 items-start">
                  <div className="bg-red-600/20 text-red-200 rounded-lg p-2">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{item.title}</div>
                    <p className="text-sm text-gray-300">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            className="bg-white text-black rounded-3xl shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)] border border-gray-200 p-6 md:p-8 space-y-5"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <p className="text-red-600 uppercase tracking-wider text-xs">Contact form</p>
              <h3 className="text-2xl font-semibold">Send a message to the shop</h3>
              <p className="text-gray-600">
                Use this for general questions, special orders, delivery or pickup requests, and paperwork copies.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold text-gray-800">
                Name
                <input
                  required
                  type="text"
                  value={formValues.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Full name"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-gray-800">
                Email
                <input
                  required
                  type="email"
                  value={formValues.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="you@example.com"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-gray-800">
                Phone
                <input
                  type="tel"
                  value={formValues.phone}
                  onChange={(event) => handleChange("phone", event.target.value)}
                  className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Optional"
                />
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                <div className="font-semibold text-gray-900">What to include</div>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Cut size or grind preference</li>
                  <li>Pickup or delivery timing</li>
                  <li>Any paperwork needed</li>
                </ul>
              </div>
              <label className="flex flex-col gap-2 text-sm font-semibold text-gray-800 md:col-span-2">
                Message
                <textarea
                  required
                  rows={5}
                  placeholder="Questions, special orders, or delivery notes..."
                  value={formValues.message}
                  onChange={(event) => handleChange("message", event.target.value)}
                  className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-y min-h-[140px]"
                />
              </label>
            </div>
            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {formError}
              </div>
            )}
            {formStatus === "success" && (
              <div className="rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm">
                Thanks! We received your message and will respond during shop hours.
              </div>
            )}
            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send message"}
              </button>
              <p className="text-sm text-gray-500">
                Prefer to talk? Call{" "}
                <a className="text-red-600 font-semibold" href="tel:+15874056328">
                  (587) 405-6328
                </a>{" "}
                during business hours.
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
