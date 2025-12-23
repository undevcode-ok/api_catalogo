import { ApiError } from "../utils/ApiError";
import { type ZodSchema } from "zod";
import { type RequestHandler } from "express";

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ApiError(400, "Datos inválidos", { errors: result.error.errors }));
      return;
    }

    req.body = result.data;
    next();
  };
}
