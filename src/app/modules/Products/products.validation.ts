import { z } from 'zod';

const productZodSchema = z.object({
  body: z.object({
    productName: z.string().min(1).max(100),
    description: z.string().max(500),
    price: z.number().min(0),
    stockQuantity: z.number().min(0),
    minStockThreshold: z.number().min(0).default(5),
  }),
});

export const productValidation = {
  createProductZodSchema: productZodSchema,
  updateProductZodSchema: productZodSchema.partial(),
};
