import { z } from "zod";

export const adminVendorSchema = z.object({
  id: z.string(),
  shop_name: z.string(),
  city: z.string(),
  address: z.string(),
  contact_phone: z.string(),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  is_verified: z.boolean(),
  verification_status: z.enum(["unrequested", "pending", "verified", "rejected"]),
  business_license: z.string().nullable(),
  tin_number: z.string(),
  rating_avg: z.string(),
  rating_count: z.number(),
  joined_at: z.string(),
  owner_name: z.string(),
  owner_email: z.string(),
});

export const adminVendorPaginationSchema = z.object({
  total_records: z.number(),
  total_pages: z.number(),
  page_size: z.number(),
  current_page: z.number(),
});

export const adminVendorListSchema = z.object({
  pagination: adminVendorPaginationSchema,
  results: z.array(adminVendorSchema),
});
