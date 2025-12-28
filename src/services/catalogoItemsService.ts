import Catalogo from "../models/Catalogo";
import CatalogoItem from "../models/CatalogoItem";
import { ApiError } from "../utils/ApiError";

export type CatalogoItemInput = {
  name?: string;
  description?: string | null;
  price?: string | number | null;
  image?: string | null;
};

type CatalogoItemUpdate = {
  name?: string;
  description?: string | null;
  price?: string | null;
  image?: string | null;
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

async function requireCatalogo(userId: string, catalogId: string): Promise<Catalogo> {
  const catalogo = await Catalogo.findOne({ where: { id: catalogId, userId } });
  if (!catalogo) {
    throw new ApiError(404, "Catálogo no encontrado");
  }
  return catalogo;
}

export async function createCatalogoItem(
  userId: string,
  catalogId: string,
  input: CatalogoItemInput
): Promise<CatalogoItem> {
  if (!input.name) {
    throw new ApiError(400, "Nombre requerido");
  }

  await requireCatalogo(userId, catalogId);

  const item = await CatalogoItem.create({
    catalogId,
    name: input.name,
    description: input.description ?? null,
    price: normalizePrice(input.price) ?? null,
    image: input.image ?? null
  });

  return item;
}

export async function createCatalogoItems(
  userId: string,
  catalogId: string,
  inputs: CatalogoItemInput[]
): Promise<CatalogoItem[]> {
  if (inputs.length === 0) {
    throw new ApiError(400, "Items requeridos");
  }
  if (inputs.length > 10) {
    throw new ApiError(400, "Maximo 10 items");
  }

  await requireCatalogo(userId, catalogId);

  const itemsData = inputs.map((input) => {
    if (!input.name) {
      throw new ApiError(400, "Nombre requerido");
    }
    return {
      catalogId,
      name: input.name,
      description: input.description ?? null,
      price: normalizePrice(input.price) ?? null,
      image: input.image ?? null
    };
  });

  const items = await CatalogoItem.bulkCreate(itemsData);
  return items;
}

export async function listCatalogoItems(userId: string, catalogId: string): Promise<CatalogoItem[]> {
  await requireCatalogo(userId, catalogId);
  return CatalogoItem.findAll({ where: { catalogId }, order: [["createdAt", "DESC"]] });
}

export async function getCatalogoItemByUuid(
  userId: string,
  catalogId: string,
  uuid: string
): Promise<CatalogoItem> {
  await requireCatalogo(userId, catalogId);
  const item = await CatalogoItem.findOne({ where: { catalogId, uuid } });
  if (!item) {
    throw new ApiError(404, "Item no encontrado");
  }
  return item;
}

export async function updateCatalogoItemByUuid(
  userId: string,
  catalogId: string,
  uuid: string,
  input: CatalogoItemInput
): Promise<CatalogoItem> {
  const item = await getCatalogoItemByUuid(userId, catalogId, uuid);

  const updates: CatalogoItemUpdate = {
    name: input.name,
    description: input.description,
    price: normalizePrice(input.price),
    image: input.image
  };

  const hasUpdates = Object.values(updates).some((value) => value !== undefined);
  if (!hasUpdates) {
    throw new ApiError(400, "Nada para actualizar");
  }

  await item.update(updates);
  return item;
}

export async function deleteCatalogoItemByUuid(
  userId: string,
  catalogId: string,
  uuid: string
): Promise<void> {
  const item = await getCatalogoItemByUuid(userId, catalogId, uuid);
  await item.destroy();
}
