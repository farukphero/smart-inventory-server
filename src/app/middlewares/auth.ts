import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
 
import catchAsync from '../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    // checking if the token is missing
    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
    }

    // checking if the given token is valid
    const decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayload;

    const { role, email, iat } = decoded;

    // checking if the user is exist
    const user = await User.findOne({email});

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found !');
    }
    

    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;
