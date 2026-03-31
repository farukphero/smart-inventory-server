import { Model, Types } from 'mongoose';
import { USER_ROLE } from './user.constant';


export interface TUser {

  userId: string;
  fullName: string;
  email: string;
  password: string;
  passwordChangedAt?: Date;
  role: 'superAdmin' | 'admin' | 'user' ;
  status: 'in-progress' | 'blocked' | 'active';
  otp: string;
  otpExpireDate: Date;
  isDeleted: boolean;
}

export interface UserModel extends Model<TUser> {
  //instance methods for checking if the user exist
  isUserExistsByCustomEmail(email: string): Promise<TUser>;
  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}

export type TUserRole = keyof typeof USER_ROLE;
