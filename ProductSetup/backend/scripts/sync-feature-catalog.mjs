/**
 * Sync feature catalog from featureflow-builder frontend.
 * Run from backend root: npm run sync-catalog
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendProductTs = path.resolve(
  __dirname,
  "../../featureflow-builder/src/types/product.ts",
);
const outPath = path.resolve(__dirname, "../src/data/feature-catalog.json");

const source = fs.readFileSync(frontendProductTs, "utf8");
const match = source.match(
  /export const AVAILABLE_FEATURES[\s\S]*?=\s*(\[[\s\S]*?\]);/,
);
if (!match) {
  console.error("Could not parse AVAILABLE_FEATURES from", frontendProductTs);
  process.exit(1);
}

const features = eval(match[1]);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(features, null, 2));
console.log(`Synced ${features.length} features → ${outPath}`);
