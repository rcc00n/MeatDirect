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

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export async function submitContactMessage(payload: ContactMessagePayload) {
  const response = await api.post("/contact/message/", payload);
  return response.data;
}
