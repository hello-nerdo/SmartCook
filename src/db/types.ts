import { z } from 'zod';

// Photo schema
export const PhotoSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  filename: z.string(),
  imageId: z.string().optional(),
  contentType: z.string(),
  size: z.number().int().positive(),
  metadata: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

export type Photo = z.infer<typeof PhotoSchema>;
