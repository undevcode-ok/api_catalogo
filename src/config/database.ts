import { Sequelize } from "sequelize";
import { ApiError } from "../utils/ApiError";

const DB_HOST = process.env.DB_HOST ?? "localhost";
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const DB_NAME = process.env.DB_NAME ?? "";
const DB_USER = process.env.DB_USER ?? "";
const DB_PASSWORD = process.env.DB_PASSWORD ?? "";

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  logging: false
});

export async function initDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");
  } catch (error) {
    throw new ApiError(500, "Falló la conexión a la base de datos", { cause: String(error) });
  }
}
