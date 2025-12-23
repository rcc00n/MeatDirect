import api from "./client";

export interface StorefrontSettings {
  large_cuts_category: string;
}

export async function getStorefrontSettings(signal?: AbortSignal): Promise<StorefrontSettings> {
  const response = await api.get<StorefrontSettings>("/storefront/", { signal });
  return response.data;
}
