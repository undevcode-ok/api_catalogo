import jwt, { type JwtPayload } from "jsonwebtoken";
import { ApiError } from "./ApiError";

export type AuthTokenPayload = {
  sub: string;
  role: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT secret no configurado");
  }
  return secret;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === "string") {
      throw new ApiError(401, "No autorizado");
    }

    const jwtPayload = decoded as JwtPayload;
    const sub = jwtPayload.sub;
    const role = jwtPayload.role;

    if (!sub || !role) {
      throw new ApiError(401, "No autorizado");
    }

    return { sub: String(sub), role: String(role) };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, "No autorizado");
  }
}
