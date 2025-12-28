import Catalogo from "../models/Catalogo";
import CatalogoImage from "../models/CatalogoImage";
import CatalogoItem from "../models/CatalogoItem";
import { ImageS3Service } from "../s3-image-module";
import { ApiError } from "../utils/ApiError";

export type CatalogoInput = {
  title?: string;
  description?: string | null;
  logoUrl?: string | null;
  backgroundColor?: string | null;
  componentColor?: string | null;
  isPublished?: boolean;
};

type CatalogoUpdate = {
  title?: string;
  description?: string | null;
  logoUrl?: string | null;
  backgroundColor?: string | null;
  componentColor?: string | null;
  isPublished?: boolean;
};

function extractS3Key(url: string): string | null {
  const marker = ".com/";
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return url.slice(index + marker.length);
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
    backgroundColor: input.backgroundColor ?? null,
    componentColor: input.componentColor ?? null,
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
  const catalogo = await Catalogo.findOne({
    where: { id, userId },
    include: [CatalogoItem]
  });
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
    backgroundColor: input.backgroundColor,
    componentColor: input.componentColor,
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

  const images = await CatalogoImage.findAll({ where: { catalogId: catalogo.id } });
  const keys = images
    .map((image) => extractS3Key(image.imageUrl))
    .filter((key): key is string => Boolean(key));

  if (keys.length > 0) {
    await ImageS3Service.deleteMultipleImages(keys);
  }

  await CatalogoImage.destroy({ where: { catalogId: catalogo.id } });
  await catalogo.destroy();
}
