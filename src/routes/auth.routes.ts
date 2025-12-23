import { Router } from "express";
import { login, me, register } from "../controllers/authController";
import { authMiddleware } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { loginSchema, registerSchema } from "../validations/auth.validation";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.get("/me", authMiddleware, me);

export default router;
