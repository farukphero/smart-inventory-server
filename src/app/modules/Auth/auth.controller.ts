import httpStatus from 'http-status';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  const { refreshToken, accessToken, fullName } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    // sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'লগইন সফল হয়েছে 😊',
    data: {
      accessToken,
      fullName,
    },
  });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await AuthServices.changePasswordFromProfile(
    req.user,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।',
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthServices.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved successfully!',
    data: result,
  });
});

const sendForgotPasswordCode = catchAsync(async (req, res) => {
  const { email } = req.body;

  const result = await AuthServices.sendForgotPasswordCode(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'পাসওয়ার্ড রিসেট কোড আপনার ইমেইলে পাঠানো হয়েছে।',
    data: result,
  });
});

const verifyForgotPasswordCode = catchAsync(async (req, res) => {
  await AuthServices.verifyForgotUserAuth(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'আপনার OTP যাচাই সম্পন্ন হয়েছে 😊',
    data: '',
  });
});

const updateForgotPassword = catchAsync(async (req, res) => {
  await AuthServices.updateForgotPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'পাসওয়ার্ড সফলভাবে আপডেট হয়েছে 😊',
    data: '',
  });
});

const logout = catchAsync(async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    // sameSite: "none",
  });
  await AuthServices.logout();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logout successful.',
    data: '',
  });
});

// const forgetPassword = catchAsync(async (req, res) => {
// 	const userEmail = req.body.email;
// 	const result = await AuthServices.forgetPassword(userEmail);
// 	sendResponse(res, {
// 		statusCode: httpStatus.OK,
// 		success: true,
// 		message: "ভেরিফিকেশন কোড পাঠানো হয়েছে। ইমেইল দেখুন।",
// 		data: result,
// 	});
// });

// const resetPassword = catchAsync(async (req, res) => {
// 	const token = req.headers.authorization;

// 	if (!token) {
// 		throw new AppError(httpStatus.BAD_REQUEST, "Something went wrong !");
// 	}

// 	const result = await AuthServices.resetPassword(req.body, token);
// 	sendResponse(res, {
// 		statusCode: httpStatus.OK,
// 		success: true,
// 		message: "Password reset successfully!",
// 		data: result,
// 	});
// });

export const AuthControllers = {
  loginUser,
  changePassword,
  refreshToken,
  logout,
  // forgetPassword,
  // resetPassword,
  sendForgotPasswordCode,
  verifyForgotPasswordCode,
  updateForgotPassword,
};
