import { type RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";

export const authMiddleware: RequestHandler = (req, _res, next) => {
  const header = req.header("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    next(new ApiError(401, "No autorizado"));
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    next(new ApiError(401, "No autorizado"));
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (error) {
    next(error);
  }
};
