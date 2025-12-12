import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Shield,
  Sparkles,
} from "lucide-react";

import {
  fetchWholesaleCatalog,
  fetchWholesaleSession,
  submitWholesaleRequest,
  verifyWholesaleCode,
  type WholesaleCatalogItem,
} from "../api/wholesale";

type AccessState = {
  status: "checking" | "locked" | "granted";
  expiresAt?: string | null;
  keyLabel?: string | null;
};

type RequestFormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

const assurances = [
  { title: "Cold-chain intact", copy: "Insulated vans, temp logs on handoff, and dated case labels." },
  { title: "Cut sheets on request", copy: "Trim specs, grind ratios, and COAs available for every invoice." },
  { title: "Priority holds", copy: "Lock inventory for 24 hours while you finalize menus or headcounts." },
];

const guardrails = [
  "Codes are issued manually to vetted accounts.",
  "Keys can be rotated at any time; save the latest code when approved.",
  "Do not forward pricing outside of your team without clearance.",
];

function formatExpiry(expiresAt?: string | null) {
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function WholesalePage() {
  const [accessState, setAccessState] = useState<AccessState>({ status: "checking" });
  const [codeInput, setCodeInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [requestValues, setRequestValues] = useState<RequestFormState>({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [requestStatus, setRequestStatus] = useState<"idle" | "success" | "error">("idle");
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [catalogItems, setCatalogItems] = useState<WholesaleCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await fetchWholesaleSession();
        if (session.active) {
          setAccessState({ status: "granted", expiresAt: session.expires_at ?? null, keyLabel: session.key_label ?? null });
        } else {
          setAccessState({ status: "locked" });
        }
      } catch (error) {
        console.warn("Wholesale session lookup failed", error);
        setAccessState({ status: "locked" });
      }
    };

    loadSession();
  }, []);

  const loadCatalog = useCallback(async () => {
    if (accessState.status !== "granted") {
      setCatalogItems([]);
      return;
    }

    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const data = await fetchWholesaleCatalog();
      setCatalogItems(data.items || []);
      if (data.expires_at) {
        setAccessState((prev) =>
          prev.status === "granted" ? { ...prev, expiresAt: prev.expiresAt ?? data.expires_at } : prev
        );
      }
    } catch (error) {
      console.error("Failed to load wholesale catalog", error);
      setCatalogError("Unable to load catalog. Try refreshing or re-entering your code.");
    } finally {
      setCatalogLoading(false);
    }
  }, [accessState.status]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const handleCodeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!codeInput.trim()) {
      setVerifyError("Enter the access code you received from the team.");
      return;
    }

    setVerifying(true);
    setVerifyError(null);
    try {
      const result = await verifyWholesaleCode(codeInput.trim());
      setAccessState({ status: "granted", expiresAt: result.expires_at, keyLabel: result.key_label });
      setCodeInput("");
    } catch (error) {
      console.error("Failed to verify wholesale access", error);
      setVerifyError("Invalid or expired code. Request a new one if you recently received approval.");
      setAccessState({ status: "locked" });
    } finally {
      setVerifying(false);
    }
  };

  const handleRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequestSubmitting(true);
    setRequestStatus("idle");
    setRequestError(null);

    try {
      await submitWholesaleRequest({
        name: requestValues.name.trim(),
        email: requestValues.email.trim(),
        phone: requestValues.phone.trim(),
        company: requestValues.company.trim(),
        message: requestValues.message.trim(),
      });
      setRequestStatus("success");
      setRequestValues({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (error) {
      console.error("Failed to submit wholesale request", error);
      setRequestError("We could not save your request right now. Try again or call the shop.");
      setRequestStatus("error");
    } finally {
      setRequestSubmitting(false);
    }
  };

  const accessLabel = useMemo(() => {
    if (accessState.status === "granted") return "Access granted";
    if (accessState.status === "checking") return "Checking access";
    return "Locked";
  }, [accessState.status]);

  const expiresReadable = formatExpiry(accessState.expiresAt);

  return (
    <div className="landing-page bg-black text-white">
      <section className="landing-section bg-gradient-to-br from-black via-slate-900 to-red-950 py-16 border-b border-red-900/40">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.28em] text-red-200">Wholesale program</span>
              <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs border border-white/15 flex items-center gap-2">
                <Shield size={14} /> Code required
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Locked wholesale pricing for partners who need sharper numbers.
            </h1>
            <p className="text-lg text-gray-200 max-w-3xl">
              Restaurants, caterers, teams, and serious home cooks get access to case pricing, consistent trim specs, and
              a butcher who answers on the first ring. Request approval or enter your issued access code to unlock rates.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-2 rounded-full bg-red-600 text-white text-sm font-semibold flex items-center gap-2">
                <BadgeCheck size={14} /> Vetted accounts only
              </span>
              <span className="px-3 py-2 rounded-full bg-white/10 text-white text-sm font-semibold flex items-center gap-2">
                <Sparkles size={14} /> Menu-ready cuts
              </span>
              <span className="px-3 py-2 rounded-full bg-white/10 text-white text-sm font-semibold flex items-center gap-2">
                <Building2 size={14} /> Cleveland & surrounding
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              {assurances.map((item) => (
                <div key={item.title} className="border border-white/15 bg-white/5 rounded-2xl p-4 space-y-2 shadow-lg">
                  <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-red-200">{item.title}</div>
                  <p className="text-gray-200 text-sm leading-relaxed">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white text-black rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-3">
              <div>
                <p className="text-red-600 uppercase tracking-[0.2em] text-xs">Access control</p>
                <h3 className="text-2xl font-semibold">Enter your wholesale code</h3>
                <p className="text-gray-600 text-sm">Codes are issued manually. Paste the latest one you received.</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  accessState.status === "granted"
                    ? "bg-emerald-100 text-emerald-800"
                    : accessState.status === "checking"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-900 text-white"
                }`}
              >
                {accessLabel}
              </div>
            </div>
            <form className="p-6 space-y-3" onSubmit={handleCodeSubmit}>
              <label className="text-sm font-semibold text-black flex items-center gap-2" htmlFor="wholesale-code">
                <KeyRound size={16} /> Access code
              </label>
              <input
                id="wholesale-code"
                type="text"
                value={codeInput}
                onChange={(event) => setCodeInput(event.target.value)}
                placeholder="Paste the code you received"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={verifying}
                autoComplete="one-time-code"
              />
              {expiresReadable && (
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Session active until {expiresReadable}
                </div>
              )}
              {verifyError && <div className="text-sm text-red-600">{verifyError}</div>}
              <button
                type="submit"
                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                disabled={verifying}
              >
                {verifying ? "Verifying..." : "Unlock pricing"}
                <ArrowRight size={16} />
              </button>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-200">
                Lost your code? Submit a new request or contact us to rotate a key. Codes can be changed without notice to
                protect existing partners.
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="landing-section bg-white text-black py-16 border-b border-gray-200">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-3">
              <p className="text-red-600 uppercase tracking-[0.2em] text-xs">Request access</p>
              <h2 className="text-3xl font-semibold">Tell us about your program.</h2>
              <p className="text-gray-600 max-w-2xl">
                Share a quick profile so we can match you with the right pricing and delivery window. A team member will
                review and issue a code once approved.
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-black text-white flex items-center gap-2">
                  <Lock size={14} /> Manual approval
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 flex items-center gap-2">
                  <Phone size={14} /> Same-day callbacks
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 flex items-center gap-2">
                  <Mail size={14} /> Email confirmation
                </span>
              </div>
            </div>
            <div className="bg-gray-900 text-white rounded-2xl p-4 border border-gray-800 space-y-2 max-w-sm">
              <div className="flex items-center gap-3">
                <Shield size={18} />
                <div>
                  <div className="text-sm font-semibold">Guardrails</div>
                  <div className="text-gray-300 text-sm">Protecting partner pricing.</div>
                </div>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                {guardrails.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-200 shadow-lg grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Sparkles size={16} className="text-red-600" /> Faster approval when all fields are filled out.
              </div>
              <form className="space-y-4" onSubmit={handleRequestSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="request-name">
                      Contact name
                    </label>
                    <input
                      id="request-name"
                      type="text"
                      required
                      value={requestValues.name}
                      onChange={(event) => setRequestValues((prev) => ({ ...prev, name: event.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="request-email">
                      Work email
                    </label>
                    <input
                      id="request-email"
                      type="email"
                      required
                      value={requestValues.email}
                      onChange={(event) => setRequestValues((prev) => ({ ...prev, email: event.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="request-phone">
                      Phone
                    </label>
                    <input
                      id="request-phone"
                      type="tel"
                      value={requestValues.phone}
                      onChange={(event) => setRequestValues((prev) => ({ ...prev, phone: event.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="request-company">
                      Company or team name
                    </label>
                    <input
                      id="request-company"
                      type="text"
                      value={requestValues.company}
                      onChange={(event) => setRequestValues((prev) => ({ ...prev, company: event.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Restaurant, catering team, etc."
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-800" htmlFor="request-message">
                    Needs and volumes
                  </label>
                  <textarea
                    id="request-message"
                    rows={4}
                    value={requestValues.message}
                    onChange={(event) => setRequestValues((prev) => ({ ...prev, message: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Cuts, weekly volume, delivery/pickup preference, timelines."
                  />
                </div>
                {requestError && <div className="text-sm text-red-600">{requestError}</div>}
                {requestStatus === "success" && (
                  <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Request received. We will respond with a code after approval.
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={requestSubmitting}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    {requestSubmitting ? "Submitting..." : "Submit request"}
                    <ArrowRight size={16} />
                  </button>
                  <span className="text-sm text-gray-600">Manual review. Expect a response within one business day.</span>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <div className="text-lg font-semibold">What you unlock</div>
              </div>
              <ul className="space-y-3">
                {[
                  "Case pricing on beef, pork, poultry, and smokehouse items.",
                  "Standing orders with delivery windows and backup pickup slots.",
                  "Direct line to the butcher who trims your orders.",
                  "Priority notice when specials or overstock drop.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-red-600" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
                Already approved? Use the access code delivered by the team. Admins can rotate codes at any time for
                security.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-slate-950 text-white py-14">
        <div className="w-full max-w-[1300px] mx-auto px-4 md:px-8 space-y-8">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div className="space-y-3">
              <p className="text-red-200 uppercase tracking-[0.2em] text-xs">Wholesale vault</p>
              <h2 className="text-3xl font-semibold">Exclusive pricing lives here.</h2>
              <p className="text-gray-200 max-w-2xl">
                Access codes let us publish aggressive pricing without opening it to the public. Unlocking keeps inventory
                honest and protects long-term partners.
              </p>
            </div>
            {accessState.status === "granted" ? (
              <div className="px-4 py-2 rounded-full bg-emerald-900/50 border border-emerald-500/40 text-emerald-100 flex items-center gap-2">
                <CheckCircle2 size={16} /> Active access
                {accessState.keyLabel && <span className="text-xs text-emerald-200">({accessState.keyLabel})</span>}
                {expiresReadable && <span className="text-xs text-emerald-200">· Expires {expiresReadable}</span>}
              </div>
            ) : (
              <div className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white flex items-center gap-2">
                <Lock size={16} /> Locked · Submit a request or enter your code
              </div>
            )}
          </div>

          {accessState.status === "granted" ? (
            catalogLoading ? (
              <div className="border border-white/15 bg-black/40 rounded-2xl p-5 text-gray-200 flex items-center gap-3">
                <Sparkles size={18} className="text-red-300" />
                <div>
                  <div className="text-lg font-semibold">Loading wholesale catalog…</div>
                  <p className="text-sm text-gray-300">Sit tight while we fetch the locked pricing.</p>
                </div>
              </div>
            ) : catalogError ? (
              <div className="border border-red-400/50 bg-red-900/30 rounded-2xl p-5 text-red-100 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock size={18} />
                  <div className="text-lg font-semibold">Could not load catalog</div>
                </div>
                <p className="text-sm">{catalogError}</p>
                <button
                  type="button"
                  onClick={() => {
                    void loadCatalog();
                  }}
                  className="bg-white text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors inline-flex items-center gap-2"
                >
                  Try again
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : catalogItems.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalogItems.map((item: WholesaleCatalogItem) => (
                  <div key={item.name} className="border border-white/10 bg-white/5 rounded-2xl p-4 space-y-2 shadow-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-white">{item.name}</div>
                        <div className="text-sm text-gray-300">{item.pack}</div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-900/40 text-emerald-200 text-sm font-semibold">
                        {item.price}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{item.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-white/15 bg-black/40 rounded-2xl p-5 text-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Sparkles size={18} className="text-red-300" /> Catalog will appear after approval
                </div>
                <p className="text-sm text-gray-300">
                  Your access is active, but no wholesale lines are published yet. We will populate this as soon as pricing
                  is cleared for your account.
                </p>
              </div>
            )
          ) : (
            <div className="border border-white/15 bg-black/40 rounded-2xl p-5 text-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Lock size={22} className="mt-1 text-red-300" />
                <div>
                  <div className="text-lg font-semibold">Pricing is locked.</div>
                  <p className="text-sm text-gray-300">
                    Enter the issued code above to reveal wholesale pricing and current inventory highlights.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-red-600 text-white text-sm font-semibold flex items-center gap-2">
                  <KeyRound size={14} /> Access code required
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm font-semibold flex items-center gap-2">
                  <Phone size={14} /> Call to rotate code
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default WholesalePage;
