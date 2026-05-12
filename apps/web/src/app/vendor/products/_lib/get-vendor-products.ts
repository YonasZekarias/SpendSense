import { apiClient } from "@/lib/api";
import { marketCategorySchema, paginatedSchema, vendorPriceSchema } from "@/lib/validation/vendor";
import type { VendorPriceResponse } from "@/types/api/vendor";
import { z } from "zod";

const userProfileSchema = z
  .object({
    vendor_info: z
      .object({
        vendor_id: z.union([z.string(), z.number()]).optional(),
      })
      .optional(),
    vendor_id: z.union([z.string(), z.number()]).optional(),
    vendor: z
      .object({
        id: z.union([z.string(), z.number()]).optional(),
        vendor_id: z.union([z.string(), z.number()]).optional(),
      })
      .optional(),
  })
  .passthrough();

const vendorPriceWithStockSchema = vendorPriceSchema
  .extend({
    stock_count: z.number().optional(),
    quantity: z.number().optional(),
  })
  .passthrough();

const paginationMetadataSchema = z.object({
  total_records: z.number().nonnegative(),
  total_pages: z.number().int().positive(),
  page_size: z.number().int().positive(),
  current_page: z.number().int().positive(),
});

const legacyPaginatedListingsSchema = z.object({
  results: z.array(vendorPriceWithStockSchema),
  pagination: paginationMetadataSchema.optional(),
});

export type VendorProductWithStock = VendorPriceResponse & {
  stock_count?: number;
  quantity?: number;
};

export type VendorProductsFilters = {
  page: number;
  q: string;
  category: string;
  sort: string;
};

export type VendorProductsResult = {
  vendorId: string;
  products: VendorProductWithStock[];
  pagination: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
  };
};

export async function getVendorProductCategories(): Promise<string[]> {
  const categoriesRaw = await apiClient<unknown>({
    method: "GET",
    endpoint: "/api/market/categories/",
  });

  const parsed = z.array(marketCategorySchema).safeParse(categoriesRaw);
  if (!parsed.success) {
    return [];
  }

  return Array.from(
    new Set(
      parsed.data
        .map((item) => item.name.trim())
        .filter((name) => name.length > 0),
    ),
  );
}

function normalizeVendorId(profile: z.infer<typeof userProfileSchema>): string {
  const candidate =
    profile.vendor_info?.vendor_id ??
    profile.vendor_id ??
    profile.vendor?.id ??
    profile.vendor?.vendor_id;
  return candidate ? String(candidate) : "";
}

function mapSortToOrdering(sort: string): string {
  switch (sort) {
    case "price_asc":
      return "price";
    case "price_desc":
      return "-price";
    case "oldest":
      return "date";
    case "recently_added":
    default:
      return "-date";
  }
}

export async function getVendorProducts(filters: VendorProductsFilters): Promise<VendorProductsResult> {
  const profileRaw = await apiClient<unknown>({
    method: "GET",
    endpoint: "/api/users/me/",
  });
  const profile = userProfileSchema.parse(profileRaw);
  const vendorId = normalizeVendorId(profile);

  if (!vendorId) {
    return {
      vendorId: "",
      products: [],
      pagination: {
        total_records: 0,
        total_pages: 1,
        page_size: 10,
        current_page: 1,
      },
    };
  }

  const query: Record<string, string | number | boolean | null | undefined> = {
    page: filters.page,
    ordering: mapSortToOrdering(filters.sort),
    q: filters.q || undefined,
    search: filters.q || undefined,
    category: filters.category !== "all" ? filters.category : undefined,
  };

  const dataRaw = await apiClient<unknown>({
    method: "GET",
    endpoint: `/api/ecommerce/vendors/${vendorId}/listings/`,
    query,
  });

  const drfParsed = paginatedSchema(vendorPriceWithStockSchema).safeParse(dataRaw);
  if (drfParsed.success) {
    const pageSize = drfParsed.data.results.length || 10;
    return {
      vendorId,
      products: drfParsed.data.results,
      pagination: {
        total_records: drfParsed.data.count,
        total_pages: Math.max(1, Math.ceil(drfParsed.data.count / pageSize)),
        page_size: pageSize,
        current_page: filters.page,
      },
    };
  }

  const legacyParsed = legacyPaginatedListingsSchema.safeParse(dataRaw);
  if (legacyParsed.success) {
    const fallbackPageSize = legacyParsed.data.results.length || 10;
    return {
      vendorId,
      products: legacyParsed.data.results,
      pagination: legacyParsed.data.pagination ?? {
        total_records: legacyParsed.data.results.length,
        total_pages: 1,
        page_size: fallbackPageSize,
        current_page: filters.page,
      },
    };
  }

  const listParsed = z.array(vendorPriceWithStockSchema).safeParse(dataRaw);
  if (listParsed.success) {
    return {
      vendorId,
      products: listParsed.data,
      pagination: {
        total_records: listParsed.data.length,
        total_pages: 1,
        page_size: listParsed.data.length || 10,
        current_page: filters.page,
      },
    };
  }

  return {
    vendorId,
    products: [],
    pagination: {
      total_records: 0,
      total_pages: 1,
      page_size: 10,
      current_page: 1,
    },
  };
}
