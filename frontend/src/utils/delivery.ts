export interface DeliveryArea {
  key: string;
  label: string;
  feeCents: number;
  cityKeywords: string[];
  postalPrefixes: string[];
}

export interface DeliveryQuote {
  area: DeliveryArea;
  feeCents: number;
  etaText: string;
}

export const DELIVERY_AREAS: DeliveryArea[] = [
  {
    key: "st_albert",
    label: "St. Albert",
    feeCents: 2000,
    cityKeywords: ["st albert", "st. albert", "saint albert"],
    postalPrefixes: ["T8N", "T8T"],
  },
  {
    key: "sherwood_park",
    label: "Sherwood Park",
    feeCents: 2500,
    cityKeywords: ["sherwood park", "sherwood"],
    postalPrefixes: ["T8A", "T8B", "T8H"],
  },
  {
    key: "spruce_grove",
    label: "Spruce Grove",
    feeCents: 3500,
    cityKeywords: ["spruce grove"],
    postalPrefixes: ["T7X"],
  },
  {
    key: "leduc",
    label: "Leduc",
    feeCents: 3500,
    cityKeywords: ["leduc"],
    postalPrefixes: ["T9E"],
  },
];

const normalizeText = (value: string) => {
  const text = (value || "").toLowerCase().replace(/[.,]/g, " ");
  return text.split(/\s+/).filter(Boolean).join(" ");
};
const normalizePostal = (value: string) => (value || "").replace(/\s+/g, "").toUpperCase();

export function summarizeDeliveryAreas(): string {
  return DELIVERY_AREAS.map((area) => `${area.label} ($${(area.feeCents / 100).toFixed(0)})`).join(", ");
}

function matchesArea(area: DeliveryArea, addressLine1: string, city: string, postalCode: string): boolean {
  const normalizedCity = normalizeText(city);
  const normalizedAddress = normalizeText(addressLine1);
  const normalizedPostal = normalizePostal(postalCode);

  const keywordHit =
    area.cityKeywords.some((keyword) => normalizedCity.includes(keyword)) ||
    area.cityKeywords.some((keyword) => normalizedAddress.includes(keyword));

  if (keywordHit) return true;

  if (normalizedPostal) {
    const prefixes = area.postalPrefixes.map((prefix) => normalizePostal(prefix));
    if (prefixes.some((prefix) => normalizedPostal.startsWith(prefix))) return true;
  }

  return false;
}

export function matchDeliveryArea(addressLine1: string, city: string, postalCode: string): DeliveryArea | null {
  if (!addressLine1 && !city && !postalCode) return null;

  for (const area of DELIVERY_AREAS) {
    if (matchesArea(area, addressLine1, city, postalCode)) {
      return area;
    }
  }

  return null;
}

export function getDeliveryEtaText(now: Date = new Date()): string {
  const hour = now.getHours();
  return hour < 12 ? "Arrives today between 4–5 PM" : "Arrives by 1 PM tomorrow";
}

export function buildDeliveryQuote(addressLine1: string, city: string, postalCode: string, now: Date = new Date()): DeliveryQuote | null {
  const area = matchDeliveryArea(addressLine1, city, postalCode);
  if (!area) return null;
  return {
    area,
    feeCents: area.feeCents,
    etaText: getDeliveryEtaText(now),
  };
}

export function calculateTaxCents(subtotalCents: number, deliveryFeeCents = 0): number {
  return Math.round((subtotalCents + deliveryFeeCents) * 0.05);
}
