import prisma from "../prisma";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { generateVerificationCode, sendVerificationCode } from "./emailService";
import createHttpError from "http-errors";

async function createUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  pfp?: string;
}) {
  const oldUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (oldUser) {
    throw createHttpError(409, "User already exists with the same email");
  }

  const password = await argon2.hash(data.password);
  const user = await prisma.user.create({
    data: { ...data, password },
  });

  try {
    const verificationCode = await generateVerificationCode(user.email);
    await sendVerificationCode(user.email, verificationCode, user.firstName);
  } catch (error) {
    // assume user will try to send another verification code if he doesnt get this one
    console.error("Error while sending verification code: ", error);
  }

  const profile = await prisma.profile.create({
    data: {
      id: user.id,
      pfp: data.pfp,
      skills: "",
    },
  });

  return {
    ...user,
    pfp: profile.pfp,
    password: undefined,
    verificationCode: undefined,
    expiresAt: undefined,
  };
}

async function getUser(data: { email: string; password: string }): Promise<{
  id: number;
  email: string;
  token: string;
}> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (!user || !(await argon2.verify(user.password, data.password))) {
    throw createHttpError(404, "Wrong password or email");
  }

  if (!user.isEmailVerified) {
    throw createHttpError(403, "Email is not verified");
  }

  const token = jwt.sign(
    { id: user?.id, email: user?.email },
    process.env.JWT_SECRET || "fallback secret",
    {
      expiresIn: "3d",
    },
  );

  return { id: user.id, email: user.email, token };
}

export { createUser, getUser };
