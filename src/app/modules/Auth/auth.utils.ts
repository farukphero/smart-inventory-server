import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

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
