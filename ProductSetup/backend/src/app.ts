import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/error-handler.js";
import { aiRouter } from "./routes/ai.routes.js";
import { catalogRouter } from "./routes/catalog.routes.js";

export function createApp() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:8080";
  app.use(
    cors({
      origin: corsOrigin.split(",").map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "featureflow-ai-backend" });
  });

  app.use("/api/catalog", catalogRouter);
  app.use("/api/ai", aiRouter);

  app.use(errorHandler);
  return app;
}
