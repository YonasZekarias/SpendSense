import { apiClient } from '@/lib/api';
import { ProductDetailResponse, PriceHistoryResponse, VendorPriceComparisonResponse, SimilarProductResponse, PriceSubmissionResponse } from '@/types/api/product-details';
import { productDetailSchema, priceHistorySchema, vendorPriceComparisonSchema, similarProductSchema, priceSubmissionSchema } from './validation/product-details';
import { z } from 'zod';

export async function getProductDetail(itemId: string) {
  const raw = await apiClient<ProductDetailResponse>({
    method: 'GET',
    endpoint: `/api/products/${itemId}`,
    next: { tags: [`product:${itemId}`], revalidate: 60 },
  });
  return productDetailSchema.parse(raw);
}

export async function getPriceHistory(itemId: string, timeRange?: string) {
  const raw = await apiClient<PriceHistoryResponse>({
    method: 'GET',
    endpoint: `/api/products/${itemId}/history`,
    query: { timeRange: timeRange || '6M' },
    next: { tags: [`product:${itemId}:history`], revalidate: 60 },
  });
  return priceHistorySchema.parse(raw);
}

export async function getVendorPriceComparisons(itemId: string, location?: string) {
  const raw = await apiClient<VendorPriceComparisonResponse[]>({
    method: 'GET',
    endpoint: `/api/products/${itemId}/vendors`,
    query: { location: location || undefined },
    next: { tags: [`product:${itemId}:vendors`], revalidate: 60 },
  });
  return z.array(vendorPriceComparisonSchema).parse(raw);
}

export async function getSimilarProducts(itemId: string) {
  const raw = await apiClient<SimilarProductResponse[]>({
    method: 'GET',
    endpoint: `/api/products/${itemId}/similar`,
    next: { tags: [`product:${itemId}:similar`], revalidate: 60 },
  });
  return z.array(similarProductSchema).parse(raw);
}

export async function getRecentPriceSubmissions(itemId: string) {
  const raw = await apiClient<PriceSubmissionResponse[]>({
    method: 'GET',
    endpoint: `/api/products/${itemId}/submissions`,
    next: { tags: [`product:${itemId}:submissions`], revalidate: 60 },
  });
  return z.array(priceSubmissionSchema).parse(raw);
}
