import { z } from 'zod';
import { isEmailValid } from './user.constant';

const createUserValidationSchema = z.object({
  body: z.object({
    fullName: z.string(),
    email: z
      .string()
      .trim()
      .refine((auth) => isEmailValid(auth), {
        message: 'Email must be valid.',
      }),
    password: z.string().refine((pwd) => !pwd || pwd.length >= 8, {
      message: 'Password must be at least 8 characters long',
    }),
  }),
});

const userValidationSchema = z.object({
  password: z
    .string({
      invalid_type_error: 'Password must be string',
    })
    .max(20, { message: 'Password can not be more than 20 characters' })
    .optional(),
});

export const UserValidation = {
  createUserValidationSchema,
  userValidationSchema,
};
