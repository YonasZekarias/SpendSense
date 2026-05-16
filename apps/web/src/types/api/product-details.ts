export interface ProductDetailResponse {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  standardUnit: string;
  origin: string | null;
  description: string;
  imageUrls: string[];
  csaTracked: boolean;
  currentAveragePrice: number;
  priceTrend: number;
  priceTrendDirection: "up" | "down" | "stable";
  volatility: "high" | "medium" | "low";
  lastUpdated: string;
  lowestPrice: { price: number; vendorName: string; location: string };
  highestPrice: { price: number; vendorName: string; location: string };
  predictedInflation: number | null;
  nationalAveragePrice: number;
}

export interface PriceHistoryResponse {
  itemId: string;
  timeRange: string;
  dataPoints: { date: string; price: number; isForecast: boolean; confidenceInterval?: [number, number] }[];
  nationalAverageDataPoints: { date: string; price: number }[];
}

export interface VendorPriceComparisonResponse {
  vendorId: string;
  vendorName: string;
  shopName: string;
  location: string;
  region: string;
  price: number;
  unit: string;
  trend7d: number;
  distanceKm: number | null;
  inStock: boolean;
  lastUpdated: string;
}

export interface SimilarProductResponse {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  trend: number;
  imageUrl: string | null;
  savingsVsCurrent: number | null;
}

export interface PriceSubmissionResponse {
  id: string;
  userInitial: string;
  location: string;
  price: number;
  date: string;
  verified: boolean;
  helpfulCount: number;
}
