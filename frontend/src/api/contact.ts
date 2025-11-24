import api from "./client";

export interface QuoteRequestPayload {
  name: string;
  phone: string;
  email: string;
  address: string;
  fulfillment: string;
  message: string;
}

export async function submitQuoteRequest(payload: QuoteRequestPayload) {
  const response = await api.post("/contact/quote/", payload);
  return response.data;
}
