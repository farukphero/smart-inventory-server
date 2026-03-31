import ejs from 'ejs';
import path from 'path';
import { sendEmail } from '../../utils/sendEmail';
import { User } from './user.model';

const findLastUserId = async () => {
  const lastUser = await User.findOne(
    {},
    {
      userId: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastUser?.userId ? lastUser.userId.substring(3) : undefined;
};

export const generateUserId = async (fullName: string) => {
  const lastUserId = await findLastUserId();

  // Numeric part
  let currentId = 0;
  if (lastUserId) {
    currentId = Number(lastUserId); // lastPostId without prefix
  }

  const nextIdNumber = currentId + 1;

  const nextIdString = nextIdNumber.toString().padStart(4, '0');

  // take first 2 characters of fullName (uppercase)
  const prefix = fullName.substring(0, 2).toUpperCase();

  return `${prefix}-${nextIdString}`;
};

// Admin ID
export const findLastAdminId = async () => {
  const lastAdmin = await User.findOne(
    {
      role: 'admin',
    },
    {
      id: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastAdmin?.userId ? lastAdmin.userId.substring(2) : undefined;
};

export const generateAdminId = async () => {
  let currentId = (0).toString();
  const lastAdminId = await findLastAdminId();

  if (lastAdminId) {
    currentId = lastAdminId.substring(2);
  }

  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');

  incrementId = `A-${incrementId}`;
  return incrementId;
};

const createVerificationOTP = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  return {
    code,
  };
};

export const sendEmailForVerification = async (email: string, name: string) => {
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
