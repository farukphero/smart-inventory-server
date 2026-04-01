import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import { createToken } from '../Auth/auth.utils';
import { isEmailValid } from './user.constant';
import { TUser } from './user.interface';
import { User } from './user.model';
import { generateUserId } from './user.utils';

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
      throw new AppError(StatusCodes.NOT_FOUND, 'Email is already in use.');
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

export const UserServices = {
  registerUserIntoDB,
};
