import {
  COMPLIANCE_RULES,
  COMPLEMENTARY_PAIRS,
  CONFLICTS,
  SAMPLE_APPROVED_PRODUCTS,
} from "../data/feature-rules.js";
import type {
  FeatureRecommendation,
  ProductData,
  RecommendationsResponse,
} from "../types/product.js";
import { getCatalog, getFeatureById } from "./catalog.service.js";

function selectedIds(productData: ProductData): Set<string> {
  return new Set(productData.features.map((f) => f.id));
}

function featureNames(ids: string[]): string {
  return ids
    .map((id) => getFeatureById(id)?.name ?? id)
    .join(", ");
}

export function buildRecommendations(
  productData: ProductData,
  approvedProducts?: ProductData[],
): RecommendationsResponse {
  const selected = selectedIds(productData);
  const recommendations: FeatureRecommendation[] = [];

  for (const pair of COMPLEMENTARY_PAIRS) {
    if (selected.has(pair.trigger) && !selected.has(pair.suggest)) {
      recommendations.push({
        type: "complementary",
        featureIds: [pair.suggest],
        title: `Consider adding ${getFeatureById(pair.suggest)?.name ?? pair.suggest}`,
        reason: pair.reason,
        severity: "info",
        action: "add",
      });
    }
  }

  for (const rule of CONFLICTS) {
    const active = rule.featureIds.filter((id) => selected.has(id));
    if (active.length >= 2) {
      recommendations.push({
        type: "conflict",
        featureIds: active,
        title: "Conflicting or redundant features",
        reason: rule.reason,
        severity: "warning",
        action: "review",
      });
    }
  }

  for (const rule of COMPLIANCE_RULES) {
    const triggersMet = rule.requiredIf.every((id) => selected.has(id));
    if (triggersMet && !selected.has(rule.suggest)) {
      recommendations.push({
        type: "compliance",
        featureIds: [rule.suggest],
        title: `Compliance gap: ${getFeatureById(rule.suggest)?.name ?? rule.suggest}`,
        reason: rule.reason,
        severity: "warning",
        action: "add",
      });
    }
  }

  const corpus =
    approvedProducts && approvedProducts.length > 0
      ? approvedProducts.map((p) => ({
          name: p.productName,
          featureIds: p.features.map((f) => f.id),
        }))
      : SAMPLE_APPROVED_PRODUCTS;

  const missingFromSimilar = findMissingFromSimilarProducts(selected, corpus);
  for (const item of missingFromSimilar) {
    recommendations.push(item);
  }

  const deduped = dedupeRecommendations(recommendations);
  const summary = summarize(deduped);

  return {
    recommendations: deduped,
    summary,
    engine: "rules",
  };
}

function findMissingFromSimilarProducts(
  selected: Set<string>,
  corpus: Array<{ name: string; featureIds: string[] }>,
): FeatureRecommendation[] {
  if (selected.size === 0) return [];

  const scores = corpus.map((product) => {
    const overlap = product.featureIds.filter((id) => selected.has(id)).length;
    const union = new Set([...product.featureIds, ...selected]).size;
    const jaccard = union === 0 ? 0 : overlap / union;
    return { product, jaccard, overlap };
  });

  scores.sort((a, b) => b.jaccard - a.jaccard);
  const best = scores[0];
  if (!best || best.overlap < 2) return [];

  const missing = best.product.featureIds.filter((id) => !selected.has(id));
  if (missing.length === 0) return [];

  const topMissing = missing.slice(0, 4);
  return [
    {
      type: "missing",
      featureIds: topMissing,
      title: `Features common on similar products (e.g. ${best.product.name})`,
      reason: `Based on approved products like "${best.product.name}", peers often include: ${featureNames(topMissing)}.`,
      severity: "info",
      action: "add",
    },
  ];
}

function dedupeRecommendations(items: FeatureRecommendation[]): FeatureRecommendation[] {
  const seen = new Set<string>();
  const out: FeatureRecommendation[] = [];
  for (const item of items) {
    const key = `${item.type}:${[...item.featureIds].sort().join(",")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function summarize(recommendations: FeatureRecommendation[]): string {
  if (recommendations.length === 0) {
    return "Your current selection looks well balanced. No critical gaps detected.";
  }
  const conflicts = recommendations.filter((r) => r.type === "conflict").length;
  const compliance = recommendations.filter((r) => r.type === "compliance").length;
  const complementary = recommendations.filter((r) => r.type === "complementary").length;
  const parts: string[] = [];
  if (conflicts > 0) parts.push(`${conflicts} conflict${conflicts > 1 ? "s" : ""} to review`);
  if (compliance > 0) parts.push(`${compliance} compliance gap${compliance > 1 ? "s" : ""}`);
  if (complementary > 0) parts.push(`${complementary} complementary suggestion${complementary > 1 ? "s" : ""}`);
  const missing = recommendations.filter((r) => r.type === "missing").length;
  if (missing > 0) parts.push("similar-product insights available");
  return `Found ${recommendations.length} recommendation(s): ${parts.join("; ")}. Catalog has ${getCatalog().length} features.`;
}
