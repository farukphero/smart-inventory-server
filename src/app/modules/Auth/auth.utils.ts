import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import ejs from 'ejs';
import path from 'path';
import { sendEmail } from '../../utils/sendEmail';

export const createToken = (
  jwtPayload: { userId: string; email: string; role: string },
  secret: Secret,
  expiresIn: string | number,
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn: expiresIn as SignOptions['expiresIn'], // 👈 safe cast
  });
};

export const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const createVerificationOTP = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  return {
    code,
  };
};

export const sendEmailVerification = async (email: string, name: string) => {
  const verificationOtp = createVerificationOTP();

  // Prepare email data
  const emailData = {
    code: verificationOtp.code,
    email,
    name,
  };

  // Render email template
  const html = await ejs.renderFile(
    path.join(__dirname, '../../templates/email.verification.ejs'),
    emailData,
  );

  await sendEmail(email, 'Verify your email address', html);

  return verificationOtp.code;
};
export const sendEmailForRegistrationId = async (
  email: string,
  name: string,
  code: string,
) => {
  // Prepare email data
  const emailData = {
    code: code,
    email,
    name,
  };

  // Render email template
  const html = await ejs.renderFile(
    path.join(__dirname, '../../templates/email.register-id.ejs'),
    emailData,
  );

  await sendEmail(email, 'Your registration Id', html);

  return code;
};

export const sendEmailForUpdatePassword = async (
  email: string,
  name: string,
) => {
  const verificationOtp = createVerificationOTP();

  // Prepare email data
  const emailData = {
    code: verificationOtp.code,
    email,
    name,
  };

  // Render email template
  const html = await ejs.renderFile(
    path.join(__dirname, '../../templates/email.forget-password.ejs'),
    emailData,
  );

  await sendEmail(email, 'Verify your email address', html);

  return verificationOtp.code;
};
