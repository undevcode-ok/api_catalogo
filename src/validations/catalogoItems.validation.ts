import { z } from "zod";
import { catalogoIdSchema } from "./images.validation";

const trimmedString = z
  .string({ required_error: "name requerido", invalid_type_error: "name inválido" })
  .trim()
  .min(1, "name requerido");

const descriptionField = z
  .string({ invalid_type_error: "description inválido" })
  .trim()
  .min(1, "description no puede estar vacío");

const optionalNullableTrimmed = z.union([descriptionField, z.null()]).optional();

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

const urlField = z
  .string({ invalid_type_error: "image inválida" })
  .trim()
  .url("image inválida");

const optionalNullableUrl = z.union([urlField, z.null()]).optional();

const itemUuidSchema = z
  .string({ required_error: "itemUuid requerido", invalid_type_error: "itemUuid inválido" })
  .trim()
  .uuid("itemUuid inválido");

const baseCreateSchema = z.object({
  name: trimmedString,
  description: optionalNullableTrimmed,
  price: priceField,
  image: optionalNullableUrl
});

export const createCatalogoItemSchema = z.union([
  baseCreateSchema,
  z.array(baseCreateSchema).min(1, "items requeridos").max(10, "maximo 10 items")
]);

export const createCatalogoItemWithCatalogSchema = baseCreateSchema.extend({
  catalogoId: catalogoIdSchema
});

export const updateCatalogoItemSchema = z.object({
  name: trimmedString.optional(),
  description: optionalNullableTrimmed,
  price: priceField,
  image: optionalNullableUrl
});

export const updateCatalogoItemWithCatalogSchema = updateCatalogoItemSchema.extend({
  catalogoId: catalogoIdSchema,
  itemUuid: itemUuidSchema
});

export const updateCatalogoItemWithCatalogOnlySchema = updateCatalogoItemSchema.extend({
  catalogoId: catalogoIdSchema
});

export const listCatalogoItemsSchema = z.object({
  catalogoId: catalogoIdSchema
});

export const getCatalogoItemSchema = z.object({
  catalogoId: catalogoIdSchema,
  itemUuid: itemUuidSchema
});

export const deleteCatalogoItemSchema = z.object({
  catalogoId: catalogoIdSchema,
  itemUuid: itemUuidSchema
});

export const deleteCatalogoItemWithCatalogOnlySchema = z.object({
  catalogoId: catalogoIdSchema
});
