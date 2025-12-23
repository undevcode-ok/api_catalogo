import Catalogo from "../models/Catalogo";
import { ApiError } from "../utils/ApiError";

export type CatalogoInput = {
  title?: string;
  description?: string | null;
  logoUrl?: string | null;
  price?: string | number | null;
  backgroundColor?: string | null;
  isPublished?: boolean;
};

type CatalogoUpdate = {
  title?: string;
  description?: string | null;
  logoUrl?: string | null;
  price?: string | null;
  backgroundColor?: string | null;
  isPublished?: boolean;
};

function normalizePrice(price: string | number | null | undefined): string | null | undefined {
  if (price === undefined) {
    return undefined;
  }
  if (price === null) {
    return null;
  }
  return typeof price === "number" ? String(price) : price;
}

export async function createCatalogo(userId: string, input: CatalogoInput): Promise<Catalogo> {
  if (!input.title) {
    throw new ApiError(400, "Título requerido");
  }

  const catalogo = await Catalogo.create({
    userId,
    title: input.title,
    description: input.description ?? null,
    logoUrl: input.logoUrl ?? null,
    price: normalizePrice(input.price) ?? null,
    backgroundColor: input.backgroundColor ?? null,
    isPublished: input.isPublished ?? false
  });

  return catalogo;
}

export async function listCatalogos(
  userId: string,
  page: number,
  limit: number
): Promise<{ items: Catalogo[]; total: number; page: number; limit: number }> {
  const offset = (page - 1) * limit;

  const result = await Catalogo.findAndCountAll({
    where: { userId },
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  return { items: result.rows, total: result.count, page, limit };
}

export async function getCatalogoById(userId: string, id: string): Promise<Catalogo> {
  const catalogo = await Catalogo.findOne({ where: { id, userId } });
  if (!catalogo) {
    throw new ApiError(404, "Catálogo no encontrado");
  }

  return catalogo;
}

export async function updateCatalogoById(
  userId: string,
  id: string,
  input: CatalogoInput
): Promise<Catalogo> {
  const catalogo = await getCatalogoById(userId, id);

  const updates: CatalogoUpdate = {
    title: input.title,
    description: input.description,
    logoUrl: input.logoUrl,
    price: normalizePrice(input.price),
    backgroundColor: input.backgroundColor,
    isPublished: input.isPublished
  };

  const hasUpdates = Object.values(updates).some((value) => value !== undefined);
  if (!hasUpdates) {
    throw new ApiError(400, "Nada para actualizar");
  }

  await catalogo.update(updates);
  return catalogo;
}

export async function deleteCatalogoById(userId: string, id: string): Promise<void> {
  const catalogo = await getCatalogoById(userId, id);
  await catalogo.destroy();
}
