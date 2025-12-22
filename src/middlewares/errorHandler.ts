import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

type ZodIssue = {
  path: Array<string | number>;
  message: string;
};

type ZodLikeError = {
  name: string;
  issues?: ZodIssue[];
};

const isApiError = (err: unknown): err is ApiError => err instanceof ApiError;

const isZodError = (err: unknown): err is ZodLikeError => {
  if (!err || typeof err !== "object") {
    return false;
  }

  return (err as { name?: unknown }).name === "ZodError";
};

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (isApiError(err)) {
    const body = err.details ? { message: err.message, details: err.details } : { message: err.message };
    res.status(err.statusCode).json(body);
    return;
  }

  if (isZodError(err)) {
    const issues = Array.isArray(err.issues) ? err.issues : [];
    res.status(400).json({ message: "Datos inválidos", errors: issues });
    return;
  }

  res.status(500).json({ message: "Error interno" });
}
