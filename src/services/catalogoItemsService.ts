import { Op } from "sequelize";
import Catalogo from "../models/Catalogo";
import CatalogoItem from "../models/CatalogoItem";
import { sequelize } from "../config/database";
import { ApiError } from "../utils/ApiError";

export type CatalogoItemInput = {
  name?: string;
  description?: string | null;
  price?: string | number | null;
  image?: string | null;
};

export type CatalogoItemBulkInput = {
  name: string;
  description?: string | null;
  price: string | number;
  image: string;
};

type CatalogoItemUpdate = {
  name?: string;
  description?: string | null;
  price?: string | null;
  image?: string | null;
};

const SORT_STEP = 10000;
type UserRole = "free" | "premium" | "admin";
const ITEM_LIMITS: Record<UserRole, number> = { free: 5, premium: 20, admin: 20 };

function normalizePrice(price: string | number | null | undefined): string | null | undefined {
  if (price === undefined) {
    return undefined;
  }
  if (price === null) {
    return null;
  }
  return typeof price === "number" ? String(price) : price;
}

function getItemLimitForRole(role: string): number {
  if (role === "premium" || role === "admin") {
    return ITEM_LIMITS[role];
  }
  return ITEM_LIMITS.free;
}

async function enforceItemLimit(
  userId: string,
  role: string,
  catalogId: string,
  incomingCount: number
): Promise<void> {
  const limit = getItemLimitForRole(role);
  await requireCatalogo(userId, catalogId);
  const existingCount = await CatalogoItem.count({ where: { catalogId } });

  if (existingCount + incomingCount > limit) {
    const message = role === "free"
      ? "Limite alcanzado de la cuenta gratuita"
      : `Maximo ${limit} items por catalogo`;
    throw new ApiError(400, message);
  }
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
  role: string,
  catalogId: string,
  input: CatalogoItemInput
): Promise<CatalogoItem> {
  if (!input.name) {
    throw new ApiError(400, "Nombre requerido");
  }

  await requireCatalogo(userId, catalogId);
  await enforceItemLimit(userId, role, catalogId, 1);

  const maxSort = await CatalogoItem.max("sortOrder", { where: { catalogId } });
  const nextSort = (Number.isFinite(maxSort) ? Number(maxSort) : 0) + SORT_STEP;

  const item = await CatalogoItem.create({
    catalogId,
    name: input.name,
    description: input.description ?? null,
    price: normalizePrice(input.price) ?? null,
    image: input.image ?? null,
    sortOrder: nextSort
  });

  return item;
}

export async function createCatalogoItems(
  userId: string,
  role: string,
  catalogId: string,
  inputs: CatalogoItemInput[]
): Promise<CatalogoItem[]> {
  if (inputs.length === 0) {
    throw new ApiError(400, "Items requeridos");
  }

  await requireCatalogo(userId, catalogId);
  await enforceItemLimit(userId, role, catalogId, inputs.length);

  const maxSort = await CatalogoItem.max("sortOrder", { where: { catalogId } });
  let nextSort = (Number.isFinite(maxSort) ? Number(maxSort) : 0) + SORT_STEP;

  const itemsData = inputs.map((input) => {
    if (!input.name) {
      throw new ApiError(400, "Nombre requerido");
    }
    const sortOrder = nextSort;
    nextSort += SORT_STEP;
    return {
      catalogId,
      name: input.name,
      description: input.description ?? null,
      price: normalizePrice(input.price) ?? null,
      image: input.image ?? null,
      sortOrder
    };
  });

  const items = await CatalogoItem.bulkCreate(itemsData);
  return items;
}

export async function createCatalogoItemsWithImages(
  userId: string,
  role: string,
  catalogId: string,
  inputs: CatalogoItemBulkInput[]
): Promise<CatalogoItem[]> {
  if (inputs.length === 0) {
    throw new ApiError(400, "Items requeridos");
  }

  await requireCatalogo(userId, catalogId);
  await enforceItemLimit(userId, role, catalogId, inputs.length);

  const maxSort = await CatalogoItem.max("sortOrder", { where: { catalogId } });
  let nextSort = (Number.isFinite(maxSort) ? Number(maxSort) : 0) + SORT_STEP;

  const itemsData = inputs.map((input) => {
    const sortOrder = nextSort;
    nextSort += SORT_STEP;
    return {
      catalogId,
      name: input.name,
      description: input.description ?? null,
      price: normalizePrice(input.price) ?? null,
      image: input.image,
      sortOrder
    };
  });

  const items = await CatalogoItem.bulkCreate(itemsData);
  return items;
}

export async function listCatalogoItems(userId: string, catalogId: string): Promise<CatalogoItem[]> {
  await requireCatalogo(userId, catalogId);
  return CatalogoItem.findAll({
    where: { catalogId },
    order: [["sortOrder", "ASC"], ["createdAt", "DESC"]]
  });
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

export async function moveCatalogoItemPosition(
  userId: string,
  catalogId: string,
  itemUuid: string,
  newPosition: number
): Promise<void> {
  if (!Number.isFinite(newPosition)) {
    throw new ApiError(400, "newPosition inválido");
  }

  const position = Math.max(1, Math.floor(newPosition));

  await sequelize.transaction(async (transaction) => {
    await requireCatalogo(userId, catalogId);

    const item = await CatalogoItem.findOne({
      where: { catalogId, uuid: itemUuid },
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    if (!item) {
      throw new ApiError(404, "Item no encontrado");
    }

    const totalCount = await CatalogoItem.count({
      where: { catalogId },
      transaction
    });

    const maxPosition = Math.max(1, totalCount);
    const targetIndex = Math.min(position, maxPosition);

    const offsetPrev = targetIndex - 2;
    const offsetNext = targetIndex - 1;

    const prevItem = offsetPrev >= 0
      ? await CatalogoItem.findOne({
          where: { catalogId, uuid: { [Op.ne]: itemUuid } },
          order: [["sortOrder", "ASC"]],
          offset: offsetPrev,
          transaction,
          lock: transaction.LOCK.UPDATE
        })
      : null;

    const nextItem = offsetNext >= 0
      ? await CatalogoItem.findOne({
          where: { catalogId, uuid: { [Op.ne]: itemUuid } },
          order: [["sortOrder", "ASC"]],
          offset: offsetNext,
          transaction,
          lock: transaction.LOCK.UPDATE
        })
      : null;

    const prevSort = prevItem ? prevItem.sortOrder : null;
    const nextSort = nextItem ? nextItem.sortOrder : null;

    let newSortOrder: number | null = null;

    if (prevSort === null && nextSort === null) {
      newSortOrder = SORT_STEP;
    } else if (prevSort === null && nextSort !== null) {
      newSortOrder = nextSort - SORT_STEP;
    } else if (prevSort !== null && nextSort === null) {
      newSortOrder = prevSort + SORT_STEP;
    } else if (prevSort !== null && nextSort !== null) {
      const gap = nextSort - prevSort;
      if (gap > 1) {
        newSortOrder = Math.floor((prevSort + nextSort) / 2);
      }
    }

    if (newSortOrder === null || newSortOrder <= 0) {
      const items = await CatalogoItem.findAll({
        where: { catalogId, uuid: { [Op.ne]: itemUuid } },
        order: [["sortOrder", "ASC"]],
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      for (let i = 0; i < items.length; i += 1) {
        await items[i].update({ sortOrder: (i + 1) * SORT_STEP }, { transaction });
      }

      const prevIndex = targetIndex - 2;
      const nextIndex = targetIndex - 1;
      const rebalancePrev = prevIndex >= 0 ? items[prevIndex] : null;
      const rebalanceNext = nextIndex >= 0 ? items[nextIndex] : null;

      if (!rebalancePrev && !rebalanceNext) {
        newSortOrder = SORT_STEP;
      } else if (!rebalancePrev && rebalanceNext) {
        newSortOrder = rebalanceNext.sortOrder - SORT_STEP;
      } else if (rebalancePrev && !rebalanceNext) {
        newSortOrder = rebalancePrev.sortOrder + SORT_STEP;
      } else if (rebalancePrev && rebalanceNext) {
        newSortOrder = Math.floor((rebalancePrev.sortOrder + rebalanceNext.sortOrder) / 2);
      }
    }

    await item.update({ sortOrder: newSortOrder ?? SORT_STEP }, { transaction });
  });
}
