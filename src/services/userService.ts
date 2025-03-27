import prisma from "../prisma";
import createHttpError from "http-errors";
import { sendVerificationCode } from "./emailService";
const crypto = require("crypto");

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

async function verifyEmail(code: string, email: string) {
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
  getAllUsers,
  generateVerificationCode,
  verifyEmail,
  resendVerificationCode,
};
