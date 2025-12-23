import { ApiError } from "../utils/ApiError";
import User from "../models/User";
import { comparePassword, hashPassword } from "../utils/password";
import { signToken } from "../utils/jwt";

export type AuthUser = {
  id: string;
  email: string;
  role: "free" | "premium" | "admin";
};

export async function registerUser(email: string, password: string): Promise<AuthUser> {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ApiError(409, "El email ya está en uso");
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email,
    passwordHash,
    role: "free",
    provider: "local"
  });

  return { id: user.id, email: user.email, role: user.role };
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new ApiError(401, "Credenciales inválidas");
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, "Credenciales inválidas");
  }

  const token = signToken({ sub: user.id, role: user.role });
  return { token, user: { id: user.id, email: user.email, role: user.role } };
}

export async function getMe(userId: string): Promise<AuthUser> {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError(401, "No autorizado");
  }

  return { id: user.id, email: user.email, role: user.role };
}
