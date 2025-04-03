import nodemailer from "nodemailer";
import prisma from "../prisma";
import createHttpError from "http-errors";
import crypto from "crypto";
import { z } from "zod";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendVerificationCode = async (
  email: string,
  code: string,
  firstName: string,
) => {
  const name = firstName[0].toUpperCase() + firstName.slice(1);

  await transporter.sendMail({
    from: `"Verification, CentarNIT Academy" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Verification Code",
    html: `
      <p>Dear ${name},</p>
      <p>Thank you for registering with us!</p>
      <p>Please use the following verification code to complete your registration process:</p>
      <p><strong>Verification Code: ${code}</strong></p>
      <p>This code is valid for the next 5 minutes. If you did not request this verification code, please ignore this email.</p>
      <p>If you encounter any issues or need further assistance, feel free to contact us.</p>
      <p>Best regards,</p>
      <p>The CentarNit Academy Team</p>
      `,
  });
};

async function generateVerificationCode(email: string) {
  await z.string().email().parseAsync(email);

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw createHttpError(404, "User not found");
  }
  if (user.isEmailVerified) {
    throw createHttpError(400, "Email is already verified");
  }

  const verificationCode = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: { verificationCode, expiresAt },
  });

  return verificationCode;
}

async function verifyCode(code: string, email: string) {
  await z.string().email().parseAsync(email);
  await z.coerce.number().int().min(100000).max(999999).parseAsync(code);

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  if (
    user.verificationCode === code &&
    user.expiresAt &&
    user.expiresAt > new Date()
  ) {
    await prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
      },
    });
    return;
  }

  throw createHttpError(400, "Invalid code");
}

async function resendVerificationCode(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { firstName: true },
  });

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const verificationCode = await generateVerificationCode(email);
  await sendVerificationCode(email, verificationCode, user.firstName);
}

export {
  generateVerificationCode,
  verifyCode,
  resendVerificationCode,
  sendVerificationCode,
};
