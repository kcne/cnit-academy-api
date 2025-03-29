import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { ZodError } from "zod";

export default async function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: err.message });
    return;
  }

  // unexpected errors
  console.error(err);
  if (err instanceof Error) {
    res.status(500).json({ error: err.message });
    return;
  }

  // really unexpected errors
  res.status(500).send({ error: err });
}
