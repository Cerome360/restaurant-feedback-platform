import { z } from 'zod';

export const submitFeedbackSchema = z.object({
  restaurantSlug: z.string().trim().min(1, 'Restaurant slug is required'),
  rating: z.coerce
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  positiveFeedback: z.string().trim().max(1000).optional().nullable(),
  improvementFeedback: z.string().trim().max(1000).optional().nullable(),
  customerName: z.string().trim().max(100).optional().nullable(),
  customerPhone: z.string().trim().max(50).optional().nullable(),
  tableNumber: z.string().trim().max(30).optional().nullable(),
});

export const feedbackFilterSchema = z.object({
  sentiment: z.enum(['ALL', 'POSITIVE', 'NEGATIVE', 'NEUTRAL']).default('ALL').optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  maxRating: z.coerce.number().min(1).max(5).optional(),
  hasContactInfo: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
  search: z.string().trim().optional(),
  status: z.enum(['ALL', 'NEW', 'REVIEWED', 'CONTACTED', 'RESOLVED']).default('ALL').optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'REVIEWED', 'CONTACTED', 'RESOLVED']),
});

export type SubmitFeedbackDto = z.infer<typeof submitFeedbackSchema>;
export type FeedbackFilterDto = z.infer<typeof feedbackFilterSchema>;
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
