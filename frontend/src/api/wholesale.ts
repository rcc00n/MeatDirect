import api from "./client";

export type WholesaleAccessRequestPayload = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
};

export type WholesaleAccessVerification = {
  status: string;
  expires_at: string;
  key_label: string;
};

export type WholesaleAccessSession = {
  active: boolean;
  expires_at?: string;
  key_label?: string;
};

export type WholesaleCatalogItem = {
  name: string;
  price: string;
  pack: string;
  note: string;
};

export type WholesaleCatalogResponse = {
  items: WholesaleCatalogItem[];
  expires_at?: string;
};

export async function submitWholesaleRequest(payload: WholesaleAccessRequestPayload) {
  const response = await api.post("/wholesale/request/", payload);
  return response.data;
}

export async function verifyWholesaleCode(code: string): Promise<WholesaleAccessVerification> {
  const response = await api.post("/wholesale/access/verify/", { code });
  return response.data;
}

export async function fetchWholesaleSession(): Promise<WholesaleAccessSession> {
  const response = await api.get("/wholesale/access/session/");
  return response.data;
}

export async function fetchWholesaleCatalog(): Promise<WholesaleCatalogResponse> {
  const response = await api.get("/wholesale/catalog/");
  return response.data;
}
