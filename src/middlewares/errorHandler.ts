import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

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

const isSequelizeRangeError = (err: unknown): err is { name?: string; message?: string } => {
  if (!err || typeof err !== "object") {
    return false;
  }
  const name = (err as { name?: string }).name ?? "";
  const message = (err as { message?: string }).message ?? "";
  return name === "SequelizeDatabaseError" && message.includes("Out of range value for column");
};

function extractColumnName(message: string): string | null {
  const match = message.match(/column '([^']+)'/i);
  return match ? match[1] : null;
}

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

  if (isSequelizeRangeError(err)) {
    const message = (err as { message?: string }).message ?? "";
    const column = extractColumnName(message);
    if (column === "price") {
      res.status(400).json({ message: "price fuera de rango (usa formato 1234.56)" });
      return;
    }
    res.status(400).json({ message: "Valor fuera de rango" });
    return;
  }

  if (err instanceof Error) {
    logger.error("[error] unhandled", { message: err.message, stack: err.stack });
  } else {
    logger.error("[error] unhandled", { err });
  }
  res.status(500).json({ message: "Error interno" });
}
