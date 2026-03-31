import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from './user.constant';
import { UserControllers } from './user.controller';
import { UserValidation } from './user.validation';


const router = express.Router();

router.post(
  '/register',
  validateRequest(UserValidation.createUserValidationSchema),
  UserControllers.registerUser,
);
router.get(
  '/singleUser',
  auth(
    USER_ROLE.user,
    USER_ROLE.adsOwner,
    USER_ROLE.member,
    USER_ROLE.admin,
    USER_ROLE.superAdmin,
  ),
  UserControllers.getUserDetails,
);

// router.put(
//   '/send-email-verify-code',
//   auth(
//     USER_ROLE.user,
//     USER_ROLE.adsOwner,
//     USER_ROLE.member,
//     USER_ROLE.admin,
//     USER_ROLE.superAdmin,
//   ),
//   UserControllers.sendEmailVerificationCode,
// );
// router.put(
//   '/verify-email-otp',
//   auth(
//     USER_ROLE.user,
//     USER_ROLE.adsOwner,
//     USER_ROLE.member,
//     USER_ROLE.admin,
//     USER_ROLE.superAdmin,
//   ),
//   UserControllers.verifyEmailCode,
// );

// router.get(
//   '/me',
//   auth(USER_ROLE.superAdmin, USER_ROLE.admin),
//   UserControllers.getMe,
// );

export const UserRoutes = router;
