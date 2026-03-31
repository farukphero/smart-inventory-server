import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import { createToken, sendEmailForRegistrationId } from '../Auth/auth.utils';
import { isEmailValid, UserRole } from './user.constant';
import { TUser } from './user.interface';
import { User } from './user.model';
import { generateUserId } from './user.utils';
import { JwtPayload } from 'jsonwebtoken';

const registerUserIntoDB = async (payload: TUser) => {
  const isAuthEmail = isEmailValid(payload.email);

  if (!isAuthEmail) {
    throw new Error('Please provide a valid email address.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if email already exists
    const existingUser = await User.findOne({
      email: payload.email,
    }).session(session);

    if (existingUser) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        'Email is already in use.',
      );
    }

    // Create a new user
    const newUser = await User.create(
      [
        {
          ...payload,
          userId: await generateUserId(payload.fullName),
        },
      ],
      { session },
    );

    // Send email for Registration ID
    await sendEmailForRegistrationId(
    	newUser[0].email,
    	newUser[0].fullName,
    	newUser[0].userId,
    );

    // JWT Payload
    const jwtPayload = {
      userId: newUser[0].userId,
      email: newUser[0].email,
      role: newUser[0].role,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string,
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string,
    );

    // Commit the transaction
    await session.commitTransaction();

    return {
      id: newUser[0].id,
      role: newUser[0].role,
      fullName: newUser[0].fullName,
      token: accessToken,
      refreshToken,
    };
  } catch (error) {
    // If anything fails, abort the transaction
    await session.abortTransaction();
    throw error;
  } finally {
    // End the session
    session.endSession();
  }
};

const getUserDetailsFromDB = async (userData: JwtPayload) => {
  const singleUser = await User.findOne({ email: userData.email }).populate(
    'savedPosts',
  );

  if (!singleUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'কোন ব্যবহারকারী পাওয়া যায়নি 😭');
  }
  if (singleUser.isDeleted) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'ব্যবহারকারী মুছে ফেলা হয়েছে ❌',
    );
  }

  // ইউজার ব্লক করা হয়েছে কিনা চেক করা
  if (singleUser.status === 'blocked') {
    throw new AppError(StatusCodes.FORBIDDEN, 'ব্যবহারকারী ব্লক করা হয়েছে 🚫');
  }
  return singleUser;
};



// const sendEmailVerificationCode = async (email: string) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const isAuthEmail = isEmailValid(email);
//     if (!isAuthEmail) {
//       throw new AppError(StatusCodes.NOT_FOUND, 'ইমেইল সঠিক নয় 😥');
//     }

//     const existingUser = await User.findOne({ email })
//       .select('emailVerifyOtp emailVerifyOtpExpireDate fullName email')
//       .session(session);
//     if (!existingUser) {
//       throw new AppError(
//         StatusCodes.NOT_FOUND,
//         'ব্যবহারকারী খুঁজে পাওয়া যায়নি 😔',
//       );
//     }

//     const otp = await sendEmailForVerification(email, existingUser.fullName);

//     // Set OTP and expiration time (5 minutes from now)
//     existingUser.emailVerifyOtp = otp;
//     existingUser.emailVerifyOtpExpireDate = new Date(
//       Date.now() + 5 * 60 * 1000,
//     ); // 5 minutes from now

//     await existingUser.save({ session });
//     await session.commitTransaction();
//     session.endSession();

//     return existingUser;
//   } catch (error) {
//     await session.abortTransaction(); // Abort the transaction if any error occurs
//     session.endSession();
//     throw error; // Rethrow the error for further handling
//   }
// };

// const verifyEmailCode = async (payload: { email: string; otp: string }) => {
//   const date = new Date();
//   const { email, otp } = payload;

//   if (!email || !otp) {
//     throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
//   }

//   const isAuthEmail = isEmailValid(email);

//   if (!isAuthEmail) {
//     throw new AppError(StatusCodes.NOT_FOUND, 'ইমেইল সঠিক নয় 😥');
//   }

//   const user = await User.findOne({ email });
//   if (!user) {
//     throw new AppError(
//       StatusCodes.NOT_FOUND,
//       'ব্যবহারকারী খুঁজে পাওয়া যায়নি 😔',
//     );
//   }

//   if (user.emailVerifyOtp !== otp) {
//     throw new AppError(StatusCodes.BAD_REQUEST, 'ভুল OTP প্রদান করা হয়েছে।');
//   }

//   if (user.emailVerifyOtpExpireDate < date) {
//     throw new AppError(StatusCodes.GONE, 'OTP এর সময়সীমা শেষ হয়ে গেছে।');
//   }

//   const result = await User.findOneAndUpdate(
//     { email },
//     {
//       $set: {
//         emailVerifyOtp: '',
//         emailVerifyOtpExpireDate: '',
//         isEmailVerified: true,
//         emailVerifiedAt: new Date(),
//       },
//     },
//     { new: true, runValidators: true },
//   );

//   return result;
// };

// const createAdminIntoDB = async () =>
//   // file: any,
//   // password: string,
//   // payload: TAdmin,
//   {
//     // create a user object
//     // const userData: Partial<TUser> = {};
//     // //if password is not given , use default password
//     // userData.password = password || (config.default_password as string);
//     // //set student role
//     // userData.role = UserRole.ADMIN;
//     // //set admin email
//     // userData.email = payload.email;
//     // const session = await mongoose.startSession();
//     // try {
//     //   session.startTransaction();
//     //   //set  generated id
//     //   userData.id = await generateAdminId();
//     //   if (file) {
//     //     const imageName = `${userData.id}${payload?.name?.firstName}`;
//     //     const path = file?.path;
//     //     //send image to cloudinary
//     //     const { secure_url } = await sendImageToCloudinary(imageName, path);
//     //     payload.profileImg = secure_url as string;
//     //   }
//     //   // create a user (transaction-1)
//     //   const newUser = await User.create([userData], { session });
//     //   //create a admin
//     //   if (!newUser.length) {
//     //     throw new AppError(StatusCodes.BAD_REQUEST, "Failed to create admin");
//     //   }
//     //   // set id , _id as user
//     //   payload.id = newUser[0].id;
//     //   payload.user = newUser[0]._id; //reference _id
//     //   // create a admin (transaction-2)
//     //   const newAdmin = await Admin.create([payload], { session });
//     //   if (!newAdmin.length) {
//     //     throw new AppError(StatusCodes.BAD_REQUEST, "Failed to create admin");
//     //   }
//     //   await session.commitTransaction();
//     //   await session.endSession();
//     //   return newAdmin;
//     // } catch (err: any) {
//     //   await session.abortTransaction();
//     //   await session.endSession();
//     //   throw new Error(err);
//     // }
//   };

// const getMe = async (userId: string, role: string) => {
//   let result = null;
//   if (role === UserRole.ADMIN) {
//     result = await Admin.findOne({ id: userId }).populate('user');
//   }
//   return result;
// };

// const changeStatus = async (id: string, payload: { status: string }) => {
//   const result = await User.findByIdAndUpdate(id, payload, {
//     new: true,
//   });
//   return result;
// };

export const UserServices = {
  registerUserIntoDB,
  getUserDetailsFromDB,
};
