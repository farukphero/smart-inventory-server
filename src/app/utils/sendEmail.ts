import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: config.SMTPHOST,
    port: 465,
    secure: true,
    auth: {
      user: config.SMTPUSER,
      pass: config.SMTPPASS,
    },
  });

  await transporter.sendMail({
    from: config.SMTPUSER,
    to,
    subject,
    html,
  });
};
