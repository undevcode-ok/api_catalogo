import dotenv from "dotenv";

dotenv.config();

const portRaw = process.env.PORT;
const PORT = portRaw ? Number(portRaw) : 3000;

if (!Number.isFinite(PORT)) {
  throw new Error("PORT must be a number");
}

export const env = {
  PORT,
  NODE_ENV: process.env.NODE_ENV ?? "development"
};
