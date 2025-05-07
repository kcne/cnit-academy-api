import prisma from "../prisma";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { generateVerificationCode, sendVerificationCode } from "./emailService";
import createHttpError from "http-errors";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const NewUserSchema = z.object({
  firstName: z.string().min(2).max(256),
  lastName: z.string().min(2).max(256),
  email: z.string().email(),
  password: z.string().min(8).max(256),
  pfp: z
    .string()
    .max(1024)
    .refine(
      (str) => str.match(/(\/pfp\/[\d\w]+\.)(png|webp|jpg|jpeg)$/),
      "Pfp string is invalid",
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
    data: { ...data, password, role: "USER" },
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
    },
  );

  return { id: user.id, email: user.email, token };
}

const oAuth2Client = new OAuth2Client(
  process.env.OAUTH2_CLIENT_ID,
  process.env.OAUTH2_CLIENT_SECRET,
  "postmessage",
);

async function googleLoginOrRegister(code: string) {
  let data;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    data = (
      await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: "Bearer " + tokens.access_token },
      })
    ).data;
  } catch {
    throw createHttpError(403, "Invalid oauth2 token");
  }

  let registered = false;
  let user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          firstName: data.given_name ?? data.name,
          lastName: data.family_name ?? "",
          email: data.email,
          password: "oauth2",
          role: "USER",
          Profile: {
            create: {
              pfp: data.picture ?? "/pfp/default.png",
              education: {},
              experience: {},
              skills: "",
            },
          },
        },
      });
      registered = true;
    } catch {
      throw createHttpError(400, "User could not be created");
    }
  }
  const token = jwt.sign(
    { id: user?.id, email: user?.email },
    process.env.JWT_SECRET || "fallback secret",
    {
      expiresIn: "3d",
    },
  );

  return { token, registered, id: user.id, email: user.email };
}

export { createUser, getUser, googleLoginOrRegister };
