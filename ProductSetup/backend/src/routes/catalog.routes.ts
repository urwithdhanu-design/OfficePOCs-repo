import { Router } from "express";
import { getCatalog, getFeatureById } from "../services/catalog.service.js";

export const catalogRouter = Router();

catalogRouter.get("/features", (_req, res) => {
  res.json({ features: getCatalog(), count: getCatalog().length });
});

catalogRouter.get("/features/:id", (req, res) => {
  const feature = getFeatureById(req.params.id);
  if (!feature) {
    res.status(404).json({ error: "Feature not found" });
    return;
  }
  res.json(feature);
});
