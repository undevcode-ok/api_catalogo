import { z } from "zod";

const trimmedString = z.string().trim().min(1);

const optionalNullableTrimmed = z.union([trimmedString, z.null()]).optional();

const urlField = z.string().trim().url();
const optionalNullableUrl = z.union([urlField, z.null()]).optional();

const priceField = z
  .union([
    z.number().positive(),
    z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Precio inválido"),
    z.null()
  ])
  .optional();

const hexColorField = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Color inválido");

const optionalNullableHex = z.union([hexColorField, z.null()]).optional();

export const createCatalogoSchema = z.object({
  title: trimmedString,
  description: optionalNullableTrimmed,
  logoUrl: optionalNullableUrl,
  price: priceField,
  backgroundColor: optionalNullableHex,
  isPublished: z.boolean().optional()
});

export const updateCatalogoSchema = z.object({
  title: trimmedString.optional(),
  description: optionalNullableTrimmed,
  logoUrl: optionalNullableUrl,
  price: priceField,
  backgroundColor: optionalNullableHex,
  isPublished: z.boolean().optional()
});
