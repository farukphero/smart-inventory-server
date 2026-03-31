import { z } from 'zod';

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Email is required!' }),
    password: z.string().min(1, { message: 'User password is required!' }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(6, { message: 'Old Password is required!' }),
    newPassword: z.string().min(6, { message: 'New Password is required!' }),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1, { message: 'Refresh Token is required!' }),
  }),
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string().min(1, { message: 'User id is required!' }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string().min(1, { message: 'User id is required!' }),
    newPassword: z.string().min(1, { message: 'User password is required!' }),
  }),
});

export const AuthValidation = {
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
};
