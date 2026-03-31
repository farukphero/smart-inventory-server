import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import { AuthControllers } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.loginUser,
);

router.post(
  '/change-password',
  auth(
    USER_ROLE.superAdmin,
    USER_ROLE.admin,
    USER_ROLE.adsOwner,
    USER_ROLE.member,
    USER_ROLE.user,
  ),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthControllers.changePassword,
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthControllers.refreshToken,
);

router.post('/logout', AuthControllers.logout);

// router.post(
// 	"/forget-password",
// 	validateRequest(AuthValidation.forgetPasswordValidationSchema),
// 	AuthControllers.forgetPassword,
// );

// router.post(
// 	"/reset-password",
// 	validateRequest(AuthValidation.forgetPasswordValidationSchema),
// 	AuthControllers.resetPassword,
// );

router.put('/send-verify-code', AuthControllers.sendForgotPasswordCode);
router.put('/verify-otp', AuthControllers.verifyForgotPasswordCode);
router.put('/set-password', AuthControllers.updateForgotPassword);

export const AuthRoutes = router;
