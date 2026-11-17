import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and dashes')
    .optional(),
  description: z.string().trim().max(500).optional(),
  address: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(50).optional(),
  retentionOffer: z.string().trim().max(300).optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export type CreateRestaurantDto = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantDto = z.infer<typeof updateRestaurantSchema>;
