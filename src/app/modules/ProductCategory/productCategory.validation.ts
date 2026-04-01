import { z } from 'zod';

const productCategoryZodSchema = z.object({
  body: z.object({
    categoryName: z
      .string({
        required_error: 'Category name is required',
      })
      .trim()
      .min(1, 'Category name is required')
      .max(50, 'Category name cannot exceed 50 characters'),

    color: z
      .string({
        required_error: 'Color is required',
      })
      .regex(
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        'Please provide a valid hex color',
      )
      .default('#6366f1'),

    icon: z
      .string({
        required_error: 'Icon is required',
      })
      .default('📦'),
  }),
});
const updateProductCategoryZodSchema = z.object({
  body: z.object({
    categoryName: z
      .string({})
      .trim()
      .min(1, 'Category name is required')
      .max(50, 'Category name cannot exceed 50 characters')
      .optional(),

    color: z
      .string({
        required_error: 'Color is required',
      })
      .regex(
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        'Please provide a valid hex color',
      )
      .default('#6366f1'),

    icon: z
      .string({
        required_error: 'Icon is required',
      })
      .default('📦'),
  }),
});

export const productCategoryValidation = {
  productCategoryZodSchema,
  updateProductCategoryZodSchema,
};
