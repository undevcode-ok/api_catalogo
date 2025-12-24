import { z } from "zod";

const trimmedString = z
  .string({ required_error: "title requerido", invalid_type_error: "title inválido" })
  .trim()
  .min(1, "title requerido");

const descriptionField = z
  .string({ invalid_type_error: "description inválido" })
  .trim()
  .min(1, "description no puede estar vacío");

const optionalNullableTrimmed = z.union([descriptionField, z.null()]).optional();

const urlField = z
  .string({ invalid_type_error: "logoUrl inválido" })
  .trim()
  .url("logoUrl inválido");

const optionalNullableUrl = z.union([urlField, z.null()]).optional();

const priceField = z
  .union([
    z.number({ invalid_type_error: "price inválido" }).positive("price debe ser positivo"),
    z
      .string({ invalid_type_error: "price inválido" })
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "price inválido"),
    z.null()
  ])
  .optional();

const hexColorField = z
  .string({ invalid_type_error: "backgroundColor inválido" })
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "backgroundColor inválido");

const optionalNullableHex = z.union([hexColorField, z.null()]).optional();

export const createCatalogoSchema = z.object({
  title: trimmedString,
  description: optionalNullableTrimmed,
  logoUrl: optionalNullableUrl,
  price: priceField,
  backgroundColor: optionalNullableHex,
  isPublished: z.boolean({ invalid_type_error: "isPublished inválido" }).optional()
});

export const updateCatalogoSchema = z.object({
  title: trimmedString.optional(),
  description: optionalNullableTrimmed,
  logoUrl: optionalNullableUrl,
  price: priceField,
  backgroundColor: optionalNullableHex,
  isPublished: z.boolean({ invalid_type_error: "isPublished inválido" }).optional()
});
