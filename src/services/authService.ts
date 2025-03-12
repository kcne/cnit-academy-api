import prisma from "../prisma";
import jwt from "jsonwebtoken";
import argon2 from "argon2";

async function createUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const user = await prisma.user.create({
    data: { ...data, password: await argon2.hash(data.password) },
  });
  return user;
}

async function getUser(data: { email: string; password: string }) {
  const user = await prisma.user.findFirst({
    where: { email: data.email, password: await argon2.hash(data.password) },
  });

  let token = jwt.sign(
    { id: user?.id, email: user?.email },
    "8faf80ea-0bb2-489d-acb7-bd6ff52f2147",
    { expiresIn: "1d" },
  );

  return { user: { ...user, password: undefined }, token };
}

export { createUser, getUser };
