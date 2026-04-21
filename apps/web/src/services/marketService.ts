import { createApiClient } from "./apiClient";

export type MarketItem = {
  id: number;
  name: string;
  category: string;
  unit: string;
};

export type MarketTrendRow = {
  date: string;
  average_price: string;
  count: number;
};

export type PriceAverageRow = {
  item_id: number;
  item_name: string;
  average_price: string;
  city: string;
  source: string;
  count: number;
};

export type SubmitPricePayload = {
  item_id: number;
  price_value: number | string;
  market_location: string;
  city: string;
  date_observed: string; // YYYY-MM-DD
};

export type PriceSubmissionResponse = {
  id: string;
  item_id: number;
  price_value: string;
  market_location: string;
  city: string;
  date_observed: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  outlier_warning?: string | null;
};

export async function getPriceAverages(params?: {
  item_id?: number;
  city?: string;
  from_date?: string;
  to_date?: string;
}): Promise<PriceAverageRow[]> {
  const api = createApiClient();
  const { data } = await api.get<PriceAverageRow[]>("/api/market/prices/averages/", { params });
  return data;
}

export async function getItems(): Promise<MarketItem[]> {
  const api = createApiClient();
  const { data } = await api.get<MarketItem[]>("/api/market/items/");
  return data;
}

export async function getItemById(itemId: number): Promise<MarketItem> {
  const api = createApiClient();
  try {
    const { data } = await api.get<MarketItem>(`/api/market/items/${itemId}/`);
    return data;
  } catch {
    const items = await getItems();
    const item = items.find((row) => row.id === itemId);
    if (!item) {
      throw new Error("Item not found.");
    }
    return item;
  }
}

export async function getPriceTrends(params: {
  item_id: number;
  city?: string;
  from_date?: string;
  to_date?: string;
}): Promise<MarketTrendRow[]> {
  const api = createApiClient();
  const { data } = await api.get<MarketTrendRow[]>("/api/market/trends/", { params });
  return data;
}

export async function submitPrice(accessToken: string, payload: SubmitPricePayload): Promise<PriceSubmissionResponse> {
  const api = createApiClient(() => accessToken);
  const { data } = await api.post<PriceSubmissionResponse>("/api/market/prices/submit/", payload);
  return data;
}

export type MarketCategory = {
  id?: number;
  name: string;
};

export async function getMarketCategories(): Promise<string[]> {
  const api = createApiClient();

  try {
    const { data } = await api.get<MarketCategory[]>("/api/market/categories/");
    if (Array.isArray(data)) {
      return data
        .map((row) => row.name?.trim())
        .filter((name): name is string => Boolean(name))
        .sort((a, b) => a.localeCompare(b));
    }
  } catch {
    // Fallback for backend versions without /categories.
  }

  const items = await getItems();
  return Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

