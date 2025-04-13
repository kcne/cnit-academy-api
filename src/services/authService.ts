import prisma from "../prisma";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { generateVerificationCode, sendVerificationCode } from "./emailService";
import createHttpError from "http-errors";
import { z } from "zod";

const NewUserSchema = z.object({
  firstName: z.string().min(2).max(256),
  lastName: z.string().min(2).max(256),
  email: z.string().email(),
  password: z.string().min(8).max(256),
  pfp: z
    .string()
    .max(64)
    .refine(
      (str) => str.match(/^(\/pfp\/\d+\.)(png|webp|jpg)$/),
      "Pfp string is invalid"
    )
    .optional(),
});
const GetUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(256),
});

async function createUser(data: z.infer<typeof NewUserSchema>) {
  await NewUserSchema.parseAsync(data);

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

async function getUser(data: z.infer<typeof GetUserSchema>): Promise<{
  id: number;
  email: string;
  token: string;
}> {
  await GetUserSchema.parseAsync(data);

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
    }
  );

  return { id: user.id, email: user.email, token };
}

export { createUser, getUser };

// GET api/role-request/ -> Uzimanje svih requestova (all, aproved, declined, pending)
// POST api/role-request/ -> slanje requesta (proveri da li postoji request)
// POST api/role-request/:request-id -> {action: approve/decline} (u ovoj ruti samo pristupaju admini)
// Nova tabela "role-requests"
// Protected rute za admina - middleware
// Tabela role-request:
// userId, bio, age, photoURL, [social-links], cover letter, status {pending || aproved/declined}, adminId (ako je odbijen ne moze da posalje request godinu dana)
// Nova tabela "professor"
// Tabela professor:
// userId, bio, age, photoURL, [social-links], cover letter, content
// linkedIn, GitHub, Portfolio, Instagram,
