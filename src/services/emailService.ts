import dotenv from "dotenv";
import nodemailer from "nodemailer";
import prisma from "../prisma";
import createHttpError from "http-errors";
import crypto from "crypto";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
} as nodemailer.TransportOptions);

const sendVerificationCode = async (
  email: string,
  code: string,
  firstName: string,
) => {
  try {
    const formattedFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1);

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Verification, CentarNIT Academy" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Verification Code",
      html: `
      <p>Dear ${formattedFirstName},</p>
      <p>Thank you for registering with us!</p>
      <p>Please use the following verification code to complete your registration process:</p>
      <p><strong>Verification Code: ${code}</strong></p>
      <p>This code is valid for the next 5 minutes. If you did not request this verification code, please ignore this email.</p>
      <p>If you encounter any issues or need further assistance, feel free to contact us.</p>
      <p>Best regards,</p>
      <p>The CentarNit Academy Team</p>
      `,
    });

    return { message: "Code sent successfully!" };
  } catch (error) {
    throw new Error("Failed to send verification code. Please try again.");
  }
};

async function getAllUsers() {
  try {
    const users = await prisma.user.findMany();

    return users;
  } catch (error) {
    throw createHttpError(500, "Failed to fetch");
  }
}

async function generateVerificationCode(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("User didn't exist!");
  }

  if (user.isEmailVerified) {
    throw new Error("E-mail already verified.");
  }

  await prisma.user.update({
    where: { email },
    data: { verificationCode: null, expiresAt: null },
  });

  const verificationCode = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: { verificationCode, expiresAt },
  });

  return verificationCode;
}

async function verifyCode(code: string, email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("User not found :(");
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

      return { message: "E-mail successfully verified." };
    } else {
      throw new Error("Invalid code.");
    }
  } catch (error) {
    throw new Error("Failed to verify e-mail, try again.");
  }
}

async function resendVerificationCode(email: string) {
  try {
    const verificationCode = await generateVerificationCode(email);
    const user = await prisma.user.findUnique({
      where: { email },
      select: { firstName: true },
    });
    const firstName = user?.firstName || "Dearest";
    await sendVerificationCode(email, verificationCode, firstName);
  } catch (err) {
    throw new Error("Failed to send a new code, try again.");
  }
}

export {
  generateVerificationCode,
  verifyCode,
  resendVerificationCode,
  sendVerificationCode,
};
