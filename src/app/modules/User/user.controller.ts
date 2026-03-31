import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

const registerUser = catchAsync(async (req, res) => {
  const result = await UserServices.registerUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is registered successfully',
    data: result,
  });
});
const getUserDetails = catchAsync(async (req, res) => {
  const result = await UserServices.getUserDetailsFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User details fetched successfully',
    data: result,
  });
});

// const updateUserDetailsIntoDB = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const result = await UserServices.updateUserDetailsIntoDB(
//     id,
//     req.body,
//     req.file,
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'আপনার তথ্য সফলভাবে আপডেট হয়েছে ✅',
//     data: result,
//   });
// });

// const sendEmailVerificationCode = catchAsync(async (req, res) => {
//   const { email } = req.body;
//   const result = await UserServices.sendEmailVerificationCode(email);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'ভেরিফিকেশন কোড আপনার ইমেইলে পাঠানো হয়েছে।',
//     data: result,
//   });
// });

// const verifyEmailCode = catchAsync(async (req, res) => {
//   await UserServices.verifyEmailCode(req.body);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'আপনার OTP যাচাই সম্পন্ন হয়েছে 😊',
//     data: '',
//   });
// });

// const createAdmin = catchAsync(async (req, res) => {
//   const { password, admin: adminData } = req.body;

//   const result = await UserServices.createAdminIntoDB(
//     // req.file,
//     // password,
//     // adminData,
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Admin is created successfully',
//     data: result,
//   });
// });

// const getMe = catchAsync(async (req, res) => {
//   const { userId, role } = req.user;
//   const result = await UserServices.getMe(userId, role);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'User is retrieved successfully',
//     data: result,
//   });
// });

// const changeStatus = catchAsync(async (req, res) => {
//   const id = req.params.id;

//   const result = await UserServices.changeStatus(id, req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Status is updated successfully',
//     data: result,
//   });
// });

export const UserControllers = {
  registerUser,
  getUserDetails,

};
