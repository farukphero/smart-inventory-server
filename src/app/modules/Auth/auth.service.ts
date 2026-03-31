import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { User } from '../User/user.model';
import { TLoginUser } from './auth.interface';
import {
  createToken,
  sendEmailForUpdatePassword,
  verifyToken,
} from './auth.utils';
import mongoose from 'mongoose';
import { isEmailValid } from '../User/user.constant';

const loginUser = async (payload: TLoginUser) => {
  // checking if the user is exist
  const user = await User.isUserExistsByCustomEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'কোন ইউজার পাওয়া যায় নাই।');
  }
  // checking if the user is already deleted

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'ইউজার ডিলিট করা হয়েছে 😥');
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'ইউজার ব্লক করা হয়েছে 😥');
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'পাসওয়ার্ড ঠিক নাই 😥');

  //create token and sent to the  client

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
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

  return {
    accessToken,
    refreshToken,
    fullName: user.fullName,
  };
};

const changePasswordFromProfile = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  const user = await User.isUserExistsByCustomEmail(userData.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'ব্যবহারকারী পাওয়া যায়নি!');
  }
  // checking if the user is already deleted

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'এই ব্যবহারকারী মুছে ফেলা হয়েছে!',
    );
  }
  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'এই ব্যবহারকারী ব্লক করা হয়েছে!');
  }

  if (await User.isPasswordMatched(payload.newPassword, user?.password)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'নতুন পাসওয়ার্ড পুরনো পাসওয়ার্ডের মতো হতে পারবে না।',
    );
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'পুরোনো পাসওয়ার্ড মিলছে না!');

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );

  return null;
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { email, iat } = decoded;

  // checking if the user is exist
  const user = await User.isUserExistsByCustomEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !');
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

const logout = async () => {
  return { message: 'Logged out successfully' };
};

const sendForgotPasswordCode = async (email: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const isAuthEmail = isEmailValid(email);
    if (!isAuthEmail) {
      throw new AppError(httpStatus.NOT_FOUND, 'ইমেইল সঠিক নয় 😥');
    }

    const existingUser = await User.findOne({ email })
      .select('otp otpExpireDate fullName email')
      .session(session);
    if (!existingUser) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'ব্যবহারকারী খুঁজে পাওয়া যায়নি 😔',
      );
    }

    const otp = await sendEmailForUpdatePassword(email, existingUser.fullName);

    // Set OTP and expiration time (5 minutes from now)
    existingUser.otp = otp;
    existingUser.otpExpireDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    await existingUser.save({ session });
    await session.commitTransaction();
    session.endSession();

    return existingUser;
  } catch (error) {
    await session.abortTransaction(); // Abort the transaction if any error occurs
    session.endSession();
    throw error; // Rethrow the error for further handling
  }
};

const verifyForgotUserAuth = async (payload: {
  email: string;
  otp: string;
}) => {
  const date = new Date();
  const { email, otp } = payload;

  if (!email || !otp) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  const isAuthEmail = isEmailValid(email);

  if (!isAuthEmail) {
    throw new AppError(httpStatus.NOT_FOUND, 'ইমেইল সঠিক নয় 😥');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'ব্যবহারকারী খুঁজে পাওয়া যায়নি 😔',
    );
  }

  if (user.otp !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'ভুল OTP প্রদান করা হয়েছে।');
  }

  if (user.otpExpireDate < date) {
    throw new AppError(httpStatus.GONE, 'OTP এর সময়সীমা শেষ হয়ে গেছে।');
  }

  const result = await User.findOneAndUpdate(
    { email },
    {
      $set: { otp: '', otpExpireDate: '' },
    },
    { new: true, runValidators: true },
  );

  return result;
};

const updateForgotPassword = async (payload: {
  email: string;
  newPassword: string;
}) => {
  const { email, newPassword } = payload;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'ব্যবহারকারী খুঁজে পাওয়া যায়নি 😔',
    );
  }

  const hasPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await User.findByIdAndUpdate(
    { _id: existingUser._id },
    {
      password: hasPassword,
      passwordChangedAt: new Date(),
      $unset: { otp: '', otpExpireDate: '' },
    },
    { new: true, runValidators: true },
  );

  return result;
};

// const forgetPassword = async (userEmail: string) => {
// 	// checking if the user is exist
// 	const user = await User.isUserExistsByCustomEmail(userEmail);

// 	if (!user) {
// 		throw new AppError(httpStatus.NOT_FOUND, "কোন ইউজার পাওয়া যায় নাই 😔");
// 	}
// 	// checking if the user is already deleted
// 	const isDeleted = user?.isDeleted;

// 	if (isDeleted) {
// 		throw new AppError(httpStatus.FORBIDDEN, "ইউজার ডিলিট করা হয়েছে 😥");
// 	}

// 	// checking if the user is blocked
// 	const userStatus = user?.status;

// 	if (userStatus === "blocked") {
// 		throw new AppError(httpStatus.FORBIDDEN, "ইউজার ব্লক করা হয়েছে 😥");
// 	}

// 	const jwtPayload = {
// 		id: user.id,
// 		email: user.email,
// 		role: user.role,
// 	};

// 	const resetToken = createToken(
// 		jwtPayload,
// 		config.jwt_access_secret as string,
// 		"10m",
// 	);

// 	const resetUILink = `${config.reset_pass_ui_link}?id=${user.id}&token=${resetToken} `;

// 	// sendEmail(user.email, resetUILink);

// 	console.log(resetUILink);
// };

// const resetPassword = async (
// 	payload: { id: string; newPassword: string },
// 	token: string,
// ) => {
// 	// checking if the user is exist
// 	const user = await User.isUserExistsByCustomEmail(payload?.id);

// 	if (!user) {
// 		throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
// 	}
// 	// checking if the user is already deleted
// 	const isDeleted = user?.isDeleted;

// 	if (isDeleted) {
// 		throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
// 	}

// 	// checking if the user is blocked
// 	const userStatus = user?.status;

// 	if (userStatus === "blocked") {
// 		throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
// 	}

// 	const decoded = jwt.verify(
// 		token,
// 		config.jwt_access_secret as string,
// 	) as JwtPayload;

// 	if (payload.id !== decoded.userId) {
// 		console.log(payload.id, decoded.userId);
// 		throw new AppError(httpStatus.FORBIDDEN, "You are forbidden!");
// 	}

// 	//hash new password
// 	const newHashedPassword = await bcrypt.hash(
// 		payload.newPassword,
// 		Number(config.bcrypt_salt_rounds),
// 	);

// 	await User.findOneAndUpdate(
// 		{
// 			id: decoded.userId,
// 			role: decoded.role,
// 		},
// 		{
// 			password: newHashedPassword,
// 			needsPasswordChange: false,
// 			passwordChangedAt: new Date(),
// 		},
// 	);
// };

export const AuthServices = {
  loginUser,
  changePasswordFromProfile,
  refreshToken,
  logout,
  // forgetPassword,
  // resetPassword,
  sendForgotPasswordCode,
  verifyForgotUserAuth,
  updateForgotPassword,
};
