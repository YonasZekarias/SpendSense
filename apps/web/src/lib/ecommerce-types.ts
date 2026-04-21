export type Identifier = string | number;

export interface Vendor {
  id: string;
  shop_name: string;
  city: string | null;
  address: string | null;
  contact_phone: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  is_verified: boolean;
  rating_avg: number | string;
  rating_count: number;
  joined_at: string;
}

export interface VendorListing {
  id: number;
  item: number;
  item_name: string;
  unit: string;
  price: number | string;
  date: string;
  is_verified: boolean;
}

export interface Recommendation {
  vendor_id: string;
  shop_name: string;
  city: string | null;
  rating_avg: number | string;
  rating_count: number;
  listing_id: number;
  price: number | string;
  item_id: number;
  item_name: string;
  unit: string;
  distance_km: number | null;
  percent_vs_market_avg: number | null;
}

export interface Purchase {
  id: string;
  vendor: string;
  vendor_price: number | null;
  quantity: number;
  amount: number | string;
  currency: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "failed" | "cancelled";
  reference: string;
  payment_method: string;
  payment_reference: string;
  payment_url: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  vendor: string;
  user: string;
  user_email: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CreatePurchaseResult extends Purchase {}

export interface ApiCollection<T> {
  results?: T[];
  data?: T[];
  items?: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export type CollectionLike<T> = T[] | ApiCollection<T>;

export type Product = Recommendation;
export type Order = Purchase;

export interface CartItem {
  listing_id: number;
  vendor_id: string;
  item_name: string;
  unit?: string;
  quantity: number;
  unit_price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  currency: string;
  updated_at: string;
}

export function normalizeCollection<T>(payload: CollectionLike<T>): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.results)) {
    return payload.results;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
}

export function normalizeCart(payload: unknown): Cart {
  if (!payload || typeof payload !== "object") {
    return { items: [], total: 0, currency: "ETB", updated_at: new Date().toISOString() };
  }

  const cart = payload as Partial<Cart>;
  const items = Array.isArray(cart.items) ? cart.items : [];
  const total = typeof cart.total === "number" ? cart.total : 0;
  return {
    items,
    total,
    currency: typeof cart.currency === "string" ? cart.currency : "ETB",
    updated_at: typeof cart.updated_at === "string" ? cart.updated_at : new Date().toISOString(),
  };
}

export function toDisplayProductName(product: Product): string {
  return String(product.item_name || `Listing #${product.listing_id}`);
}

export function toDisplayVendorName(vendor: Vendor): string {
  return String(vendor.shop_name || `Vendor #${vendor.id}`);
}
