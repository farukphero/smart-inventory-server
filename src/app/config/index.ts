import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join((process.cwd(), '.env')) });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,

  SMTPHOST: process.env.SMTPHOST,
  SMTPPORT: process.env.SMTPPORT,
  SMTPUSER: process.env.SMTPUSER,
  SMTPPASS: process.env.SMTPPASS,
  SUPPORTEMAIL: process.env.SUPPORTEMAIL,

  client_side_url: process.env.CLIENT_SIDE_URL,
  admin_side_url: process.env.ADMIN_SIDE_URL,

  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
};
