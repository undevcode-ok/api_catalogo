import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string({ required_error: "email requerido", invalid_type_error: "email inválido" })
    .trim()
    .min(1, "email requerido")
    .email("email inválido"),
  password: z
    .string({ required_error: "password requerido", invalid_type_error: "password inválido" })
    .min(6, "password debe tener al menos 6 caracteres")
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "email requerido", invalid_type_error: "email inválido" })
    .trim()
    .min(1, "email requerido")
    .email("email inválido"),
  password: z
    .string({ required_error: "password requerido", invalid_type_error: "password inválido" })
    .min(6, "password debe tener al menos 6 caracteres")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
