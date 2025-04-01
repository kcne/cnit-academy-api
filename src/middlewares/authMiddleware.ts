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
}

const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];

  if (!token) {
    throw createHttpError(401, "Authentication token is missing or malformed");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback secret",
    ) as User;
  } catch (error) {
    throw createHttpError(403, "Invalid or expired token");
  }

  const user = prisma.user.findUnique({
    where: { id: decoded.id, email: decoded.email, isEmailVerified: true },
    select: { id: true, email: true },
  });
  if (!user) {
    throw createHttpError(403, "Invalid or expired token");
  }

  req.user = decoded;
  next();
};

export default authMiddleware;
