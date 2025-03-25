import prisma from "../prisma";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { sendVerificationCode } from "./emailService";
import { generateVerificationCode } from "./userService";

async function createUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  pfp?: string;
}) {
  if (
    !(await prisma.user.findUnique({
      where: { email: data.email },
    }))
  ) {
    throw new Error("User already exists with the same email");
  }

  const password = await argon2.hash(data.password);
  const user = await prisma.user.create({
    data: { ...data, password },
  });

  try {
    const verificationCode = await generateVerificationCode(data.email);
    await sendVerificationCode(data.email, verificationCode, data.firstName);
  } catch (error) {
    // assume user will try to send another verification code if he doesnt get this one
    console.error("Error while sending verification code: ", error);
  }

  prisma.profile.create({
    data: {
      id: user.id,
      pfp: data.pfp,
      skills: "",
    },
  });

  return user;
}

async function getUser(data: { email: string; password: string }): Promise<{
  user: {
    id: number;
    email: string;
  } | null;
  token: string;
}> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (!user || !(await argon2.verify(user.password, data.password))) {
    return { user: null, token: "" };
  }
  if (!user.isEmailVerified) {
    throw new Error("Email is not verified");
  }

  const token = jwt.sign(
    { id: user?.id, email: user?.email },
    process.env.JWT_SECRET || "fallback secret",
    {
      expiresIn: "1d",
    },
  );

  return { user: { id: user.id, email: user.email }, token };
}

export { createUser, getUser };
