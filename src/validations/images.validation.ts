import { z } from "zod";

export const catalogoIdSchema = z
  .string({ required_error: "catalogoId requerido", invalid_type_error: "catalogoId inválido" })
  .trim()
  .uuid("catalogoId inválido");

export const catalogoIdObjectSchema = z.object({
  catalogoId: catalogoIdSchema
});

export const sortOrderSchema = z
  .number({ required_error: "sortOrder requerido", invalid_type_error: "sortOrder inválido" })
  .int("sortOrder debe ser entero")
  .min(0, "sortOrder debe ser >= 0");

export const sortOrderCoerceSchema = z
  .coerce
  .number({ invalid_type_error: "sortOrder inválido" })
  .int("sortOrder debe ser entero")
  .min(0, "sortOrder debe ser >= 0");

export const sortOrderObjectSchema = z.object({
  sortOrder: sortOrderCoerceSchema
});
