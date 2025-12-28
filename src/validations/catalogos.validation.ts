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

const hexColorField = z
  .string({ invalid_type_error: "backgroundColor inválido" })
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "backgroundColor inválido");

const optionalNullableHex = z.union([hexColorField, z.null()]).optional();

export const createCatalogoSchema = z.object({
  title: trimmedString,
  description: optionalNullableTrimmed,
  logoUrl: optionalNullableUrl,
  backgroundColor: optionalNullableHex,
  componentColor: optionalNullableHex,
  isPublished: z.boolean({ invalid_type_error: "isPublished inválido" }).optional()
});

export const updateCatalogoSchema = z.object({
  title: trimmedString.optional(),
  description: optionalNullableTrimmed,
  logoUrl: optionalNullableUrl,
  backgroundColor: optionalNullableHex,
  componentColor: optionalNullableHex,
  isPublished: z.boolean({ invalid_type_error: "isPublished inválido" }).optional()
});

export const createCatalogoPdfFromHtmlSchema = z.object({
  html: z
    .string({ required_error: "html requerido", invalid_type_error: "html inválido" })
    .trim()
    .min(1, "html requerido"),
  viewMode: z.string({ invalid_type_error: "viewMode inválido" }).trim().optional()
});
