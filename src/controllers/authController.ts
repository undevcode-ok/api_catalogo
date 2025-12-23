import { type Request, type Response, type NextFunction } from "express";
import { type LoginInput, type RegisterInput } from "../validations/auth.validation";
import { getMe, loginUser, registerUser } from "../services/authService";
import { ApiError } from "../utils/ApiError";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as RegisterInput;
    const user = await registerUser(email, password);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as LoginInput;
    const result = await loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, "No autorizado");
    }

    const user = await getMe(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
