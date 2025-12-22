import "dotenv/config";
import express from "express";
//import cors from "cors";

import { errorHandler } from "./middlewares/errorHandler";

// Routers (por ahora podés dejar solo los básicos)
import routes from "./routes";

// 👉 Estos quedan comentados en main
// import { initDatabase } from "./utils/databaseService";
// import { setupAssociations } from "./models/associations";
// import { loadSchemaLimits } from "./utils/schemaLimits";
// import { enableStrictMode } from "./utils/sqlStrictMode";
// import { tenantMiddleware } from "./middlewares/tenant";
// import { httpLogger } from "./middlewares/httpLogger";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

/* =========================
 * Middlewares base
 * ========================= */
//app.use(cors());
app.use(express.json());

// app.use(httpLogger);

/* =========================
 * Routes base
 * ========================= */
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
    // setupAssociations();
    // await initDatabase();
    // await enableStrictMode();
    // await loadSchemaLimits([]);

    app.listen(port, () => {
      console.log(`⚡️[servidor]: Servidor corriendo en http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

initServer();
