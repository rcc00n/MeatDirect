import type { Product } from "../types";
import api from "./client";

export async function getProducts(search?: string, signal?: AbortSignal): Promise<Product[]> {
  const response = await api.get<Product[]>("/products/", {
    params: search ? { search } : undefined,
    signal,
  });
  return response.data;
}

export async function getProduct(id: number): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}/`);
  return response.data;
}
