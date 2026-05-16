import { z } from 'zod';

export const productDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  subcategory: z.string().nullable(),
  standardUnit: z.string(),
  origin: z.string().nullable(),
  description: z.string(),
  imageUrls: z.array(z.string()),
  csaTracked: z.boolean(),
  currentAveragePrice: z.coerce.number(),
  priceTrend: z.coerce.number(),
  priceTrendDirection: z.enum(['up', 'down', 'stable']),
  volatility: z.enum(['high', 'medium', 'low']),
  lastUpdated: z.string(),
  lowestPrice: z.object({ price: z.coerce.number(), vendorName: z.string(), location: z.string() }),
  highestPrice: z.object({ price: z.coerce.number(), vendorName: z.string(), location: z.string() }),
  predictedInflation: z.coerce.number().nullable(),
  nationalAveragePrice: z.coerce.number(),
});

export const priceHistorySchema = z.object({
  itemId: z.string(),
  timeRange: z.string(),
  dataPoints: z.array(z.object({
    date: z.string(),
    price: z.coerce.number(),
    isForecast: z.boolean(),
    confidenceInterval: z.tuple([z.coerce.number(), z.coerce.number()]).optional(),
  })),
  nationalAverageDataPoints: z.array(z.object({
    date: z.string(),
    price: z.coerce.number(),
  })),
});

export const vendorPriceComparisonSchema = z.object({
  vendorId: z.string(),
  vendorName: z.string(),
  shopName: z.string(),
  location: z.string(),
  region: z.string(),
  price: z.coerce.number(),
  unit: z.string(),
  trend7d: z.coerce.number(),
  distanceKm: z.coerce.number().nullable(),
  inStock: z.boolean(),
  lastUpdated: z.string(),
});

export const similarProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  price: z.coerce.number(),
  unit: z.string(),
  trend: z.coerce.number(),
  imageUrl: z.string().nullable(),
  savingsVsCurrent: z.coerce.number().nullable(),
});

export const priceSubmissionSchema = z.object({
  id: z.string(),
  userInitial: z.string(),
  location: z.string(),
  price: z.coerce.number(),
  date: z.string(),
  verified: z.boolean(),
  helpfulCount: z.coerce.number(),
});

export const priceAlertInputSchema = z.object({
  targetPrice: z.coerce.number().positive(),
  itemId: z.string().uuid(),
});

export const productSearchParamsSchema = z.object({
  timeRange: z.enum(['1W', '1M', '3M', '6M', '1Y', 'ALL']).optional(),
  location: z.string().optional(),
});
