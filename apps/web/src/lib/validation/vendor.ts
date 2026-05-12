import { z } from "zod";

export const vendorPriceSchema = z.object({
  id: z.number(),
  item: z.number(),
  item_name: z.string(),
  unit: z.string(),
  category: z.string().optional(),
  price: z.number().or(z.string().transform((v) => Number(v))),
  image: z.string().nullable(),
  images: z
    .array(
      z.object({
        id: z.number(),
        url: z.string(),
        position: z.number(),
      }),
    )
    .optional(),
  date: z.string(),
  is_verified: z.boolean(),
});

export const marketItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string(),
  unit: z.string(),
  description: z.string(),
  image: z.string().nullable(),
});

export const marketCategorySchema = z.object({
  name: z.string(),
});

/**
 * Zod schema matching DRF's PageNumberPagination envelope.
 * Usage: paginatedSchema(marketItemSchema).parse(data)
 */
export function paginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(itemSchema),
  });
}
