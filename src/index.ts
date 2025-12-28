import "dotenv/config";
import express from "express";
//import cors from "cors";

import { errorHandler } from "./middlewares/errorHandler";
import { initDatabase, sequelize } from "./config/database";
import { setupAssociations } from "./models/associations";

// Routers (por ahora podés dejar solo los básicos)
import routes from "./routes";

// 👉 Estos quedan comentados en main
// import { loadSchemaLimits } from "./utils/schemaLimits";
// import { enableStrictMode } from "./utils/sqlStrictMode";
// import { tenantMiddleware } from "./middlewares/tenant";
// import { httpLogger } from "./middlewares/httpLogger";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

/* =========================
 * Middlewares base
 * ========================= */
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowOrigin = process.env.CORS_ORIGIN ?? origin ?? "*";
  res.header("Access-Control-Allow-Origin", allowOrigin);
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});
app.use(express.json({ limit: "5mb" }));

// app.use(httpLogger);

/* =========================
 * Routes base
 * ========================= */
app.use((req, _res, next) => {
  req.url = req.url.replace(/\/{2,}/g, "/");
  next();
});

app.use(routes);

/* =========================
 * Error handler (SIEMPRE al final)
 * ========================= */
app.use(errorHandler);

/* =========================
 * Server init
 * ========================= */
async function initServer() {
  try {
    setupAssociations();
    await initDatabase();

    if (process.env.DB_SYNC === "true") {
      await sequelize.sync({ alter: false });
    }

    app.listen(port, () => {
      console.log(`⚡️[servidor]: Servidor corriendo en http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

initServer();
