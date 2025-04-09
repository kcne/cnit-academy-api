import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import createHttpError from "http-errors";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

interface User {
  id: number;
  email: string;
  roles: string[];
}

const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];

  if (!token) {
    res
      .status(401)
      .json({ error: "Authentication token is missing or malformed" });
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback secret",
    ) as User;
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id, email: decoded.email, isEmailVerified: true },
    select: { id: true, email: true, roles: { select: { name: true } } },
  });
  if (!user) {
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }

  req.user = { ...user, roles: user.roles.map((obj) => obj.name) };
  next();
};

export default authMiddleware;
