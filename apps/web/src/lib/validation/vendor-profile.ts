import { z } from "zod";

export const vendorProfileSchema = z.object({
  id: z.string(),
  owner: z.number(),
  owner_name: z.string(),
  shop_name: z.string(),
  city: z.string(),
  address: z.string(),
  contact_phone: z.string(),
  is_verified: z.boolean(),
  verification_status: z.enum(['unrequested', 'pending', 'verified', 'rejected']),
  business_license: z.string().nullable(),
  tin_number: z.string(),
  rating_avg: z.coerce.number(),
  rating_count: z.coerce.number(),
  latitude: z.coerce.number().nullable(),
  longitude: z.coerce.number().nullable(),
  image: z.string().nullable(),
  theme_image: z.string().nullable(),
  joined_at: z.string(),
});

export const vendorVerificationRequestSchema = z.object({
  tin_number: z.string().min(5, "TIN number must be at least 5 characters"),
  business_license: z.any().refine((file) => file instanceof File, "Business license is required"),
});

export type VendorVerificationRequest = z.infer<typeof vendorVerificationRequestSchema>;
