import { type Request, type Response, type NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import {
  createCatalogo,
  deleteCatalogoById,
  getCatalogoById,
  listCatalogos,
  updateCatalogoById
} from "../services/catalogosService";

function requireUserId(req: Request): string {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "No autorizado");
  }
  return user.id;
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogo = await createCatalogo(userId, req.body);
    res.status(201).json(catalogo);
  } catch (error) {
    next(error);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;

    const page = pageRaw ? Number(pageRaw) : 1;
    const limit = limitRaw ? Number(limitRaw) : 10;

    if (!Number.isFinite(page) || page < 1 || !Number.isFinite(limit) || limit < 1 || limit > 100) {
      throw new ApiError(400, "Paginación inválida");
    }

    const result = await listCatalogos(userId, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogo = await getCatalogoById(userId, req.params.id);
    res.json(catalogo);
  } catch (error) {
    next(error);
  }
}

export async function updateById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogo = await updateCatalogoById(userId, req.params.id, req.body);
    res.json(catalogo);
  } catch (error) {
    next(error);
  }
}

export async function removeById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    await deleteCatalogoById(userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
