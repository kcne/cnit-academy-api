/**
 * Error handling middleware that catches and handles errors thrown by the application.
 * Returns error responses to the client.
 */

import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { NextFunction, Request, Response } from "express";

class ErrorResponse {
  message: string;
  code: number;

  constructor(message: string, code: number) {
    this.message = message;
    this.code = code;
  }
}

const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ErrorResponse) {
    console.error(`ErrorResponse: ${error.code} - ${error.message}`);
    res.status(error.code).json({ message: error.message });
  } else if (error instanceof PrismaClientValidationError) {
    console.error(`PrismaClientValidationError: ${error.message}`);
    res.status(400).json({ message: "Validation error" });
  } else if (error instanceof PrismaClientKnownRequestError) {
    console.error(
      `PrismaClientKnownRequestError: ${error.code} - ${error.message}`
    );
    res.status(404).json({ message: "Not found" });
  } else {
    console.error(`UnknownError: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default errorMiddleware;
export { ErrorResponse };
