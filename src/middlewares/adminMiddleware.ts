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
  roles: { id: number; name: string }[];
}

const adminMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(
      createHttpError(401, "Authentication token is missing or malformed")
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback secret"
    ) as User;
  } catch (error) {
    return next(createHttpError(403, "Invalid or expired token"));
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id, email: decoded.email, isEmailVerified: true },
    select: { id: true, email: true, roles: true },
  });

  if (!user) {
    return next(createHttpError(404, "User not found"));
  }

  const isAdmin = user.roles.some((role) => role.name === "Admin");

  if (!isAdmin) {
    return next(createHttpError(403, "Access denied: Admins only"));
  }

  req.user = user;
  next();
};

export default adminMiddleware;
