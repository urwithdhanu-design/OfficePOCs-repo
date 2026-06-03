import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { ProductFeature } from "../types/product.js";

const catalogPath = join(dirname(fileURLToPath(import.meta.url)), "../data/feature-catalog.json");
const features = JSON.parse(readFileSync(catalogPath, "utf8")) as ProductFeature[];
const byId = new Map(features.map((f) => [f.id, f]));

export function getCatalog(): ProductFeature[] {
  return features;
}

export function getFeatureById(id: string): ProductFeature | undefined {
  return byId.get(id);
}

export function resolveFeatures(ids: string[]): ProductFeature[] {
  return ids
    .map((id) => byId.get(id))
    .filter((f): f is ProductFeature => f !== undefined);
}

export function mergeFeatures(
  current: ProductFeature[],
  toAdd: ProductFeature[],
): ProductFeature[] {
  const existing = new Set(current.map((f) => f.id));
  const merged = [...current];
  for (const feature of toAdd) {
    if (!existing.has(feature.id)) {
      merged.push({ ...feature });
      existing.add(feature.id);
    }
  }
  return merged;
}
