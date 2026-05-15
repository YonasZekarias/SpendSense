import { z } from "zod";
import { topItemSchema, vendorPaginationSchema } from "./vendors";

export const vendorDetailSchema = z.object({
  id: z.string(),
  vendorName: z.string(),
  shopName: z.string(),
  location: z.string(),
  region: z.string(),
  latitude: z.coerce.number().nullable(),
  longitude: z.coerce.number().nullable(),
  rating: z.coerce.number(),
  reviewCount: z.coerce.number(),
  competitivenessScore: z.coerce.number(),
  verifiedStatus: z.enum(["Verified", "Unverified", "Pending"]),
  contactInfo: z.string(),
  itemsListed: z.coerce.number(),
  priceRangeMin: z.coerce.number(),
  priceRangeMax: z.coerce.number(),
  topItems: z.array(topItemSchema),
  imageUrl: z.string().nullable(),
  createdAt: z.string(),
  description: z.string(),
  businessHours: z.string(),
  deliveryAvailable: z.boolean(),
  deliveryEstimate: z.string().nullable(),
  paymentMethods: z.array(z.string()),
  totalSales: z.coerce.number(),
  memberSince: z.string(),
  responseTimeMinutes: z.coerce.number(),
  socialLinks: z.record(z.string(), z.string()).nullable(),
});

export const vendorProductSchema = z.object({
  id: z.coerce.string(),
  itemId: z.coerce.string(),
  itemName: z.string(),
  category: z.string(),
  imageUrl: z.string().nullable(),
  price: z.coerce.number(),
  unit: z.string(),
  comparePrice: z.coerce.number().nullable(),
  stockStatus: z.enum(["InStock", "LowStock", "OutOfStock"]),
  stockQuantity: z.coerce.number(),
  priceTrend: z.coerce.number(),
  nationalAveragePrice: z.coerce.number(),
  nationalAverageDiff: z.coerce.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const vendorProductListSchema = z.object({
  products: z.array(vendorProductSchema),
  pagination: vendorPaginationSchema,
  categories: z.array(z.string()),
  priceRange: z.object({ min: z.coerce.number(), max: z.coerce.number() }),
});

export const vendorReviewSchema = z.object({
  id: z.string(),
  userName: z.string(),
  userInitial: z.string(),
  rating: z.number(),
  comment: z.string(),
  date: z.string(),
  helpfulCount: z.number(),
  verifiedPurchase: z.boolean(),
});

export const vendorReviewListSchema = z.object({
  reviews: z.array(vendorReviewSchema),
  pagination: vendorPaginationSchema,
  averageRating: z.number(),
  totalReviews: z.number(),
  distribution: z.record(z.string(), z.number()),
});

export const productSearchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(["popularity", "price", "newest"]).optional(),
  page: z.coerce.number().optional(),
});
