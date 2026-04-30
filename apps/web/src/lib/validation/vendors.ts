import { z } from "zod";

export const vendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional(),
  city: z.string().optional(),
  status: z.string().optional(),
  products: z.number().optional(),
});

export const vendorListSchema = z.array(vendorSchema);
export type Vendor = z.infer<typeof vendorSchema>;

// Note: Replace with MCP-generated types when available and keep Zod for runtime validation.
