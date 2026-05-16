import { apiClient } from "@/lib/api";
import { VendorDetailResponse, VendorProductListResponse, VendorReviewListResponse } from "@/types/api/vendor-details";
import { vendorDetailSchema, vendorProductListSchema, vendorReviewListSchema, productSearchParamsSchema } from "@/lib/validation/vendor-details";
import { z } from "zod";

type ProductQueryParams = z.infer<typeof productSearchParamsSchema>;

export async function getVendorDetail(vendorId: string) {
  const rawData = await apiClient<VendorDetailResponse>({
    method: "GET",
    endpoint: `/api/market/vendors/${vendorId}/`,
    next: { tags: [`vendor:${vendorId}`], revalidate: 60 },
  });
  return vendorDetailSchema.parse(rawData);
}

export async function getVendorProducts(vendorId: string, params?: ProductQueryParams) {
  const query = productSearchParamsSchema.parse(params || {});
  const rawData = await apiClient<VendorProductListResponse>({
    method: "GET",
    endpoint: `/api/ecommerce/vendors/${vendorId}/listings/`,
    query: query as Record<string, string | number | boolean | null | undefined>,
    next: { tags: [`vendor:${vendorId}:products`], revalidate: 60 },
  });
  return vendorProductListSchema.parse(rawData);
}

export async function getVendorReviews(vendorId: string, page: number = 1) {
  const rawData = await apiClient<VendorReviewListResponse>({
    method: "GET",
    endpoint: `/api/market/vendors/${vendorId}/reviews/`,
    query: { page },
    next: { tags: [`vendor:${vendorId}:reviews`], revalidate: 60 },
  });
  return vendorReviewListSchema.parse(rawData);
}
