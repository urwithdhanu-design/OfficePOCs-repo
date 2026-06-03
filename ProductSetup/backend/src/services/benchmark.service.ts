import { COMPETITOR_PROFILES, type CompetitorId } from "../data/competitive-benchmarks.js";
import type { BenchmarkGap, BenchmarkResponse, ProductData } from "../types/product.js";
import { getFeatureById } from "./catalog.service.js";

function buildGap(featureId: string, competitorNote?: string): BenchmarkGap | null {
  const feature = getFeatureById(featureId);
  if (!feature) return null;
  return {
    featureId: feature.id,
    featureName: feature.name,
    category: feature.category,
    reason: competitorNote ?? feature.description,
  };
}

export function buildCompetitiveBenchmark(productData: ProductData): BenchmarkResponse {
  const selected = new Set(productData.features.map((f) => f.id));
  const competitors = COMPETITOR_PROFILES.map((profile) => {
    const present = profile.featureIds.filter((id) => selected.has(id));
    const missingIds = profile.featureIds.filter((id) => !selected.has(id));
    const gaps = missingIds
      .map((id) => buildGap(id, profile.featureNotes[id]))
      .filter((g): g is BenchmarkGap => g !== null);

    const matchPercent =
      profile.featureIds.length === 0
        ? 100
        : Math.round((present.length / profile.featureIds.length) * 100);

    return {
      competitor: profile.id,
      label: profile.label,
      tagline: profile.tagline,
      matchPercent,
      presentCount: present.length,
      totalBenchmarkFeatures: profile.featureIds.length,
      gaps,
      strengths: present
        .map((id) => getFeatureById(id))
        .filter(Boolean)
        .map((f) => ({ featureId: f!.id, featureName: f!.name })),
    };
  });

  const gapCounts = new Map<string, { featureName: string; competitors: CompetitorId[] }>();
  for (const comp of competitors) {
    for (const gap of comp.gaps) {
      const existing = gapCounts.get(gap.featureId);
      if (existing) {
        existing.competitors.push(comp.competitor);
      } else {
        gapCounts.set(gap.featureId, {
          featureName: gap.featureName,
          competitors: [comp.competitor],
        });
      }
    }
  }

  const commonGaps = [...gapCounts.entries()]
    .filter(([, v]) => v.competitors.length >= 2)
    .map(([featureId, v]) => ({
      featureId,
      featureName: v.featureName,
      missingFrom: v.competitors,
    }))
    .sort((a, b) => b.missingFrom.length - a.missingFrom.length);

  const overallScore =
    competitors.length === 0
      ? 0
      : Math.round(
          competitors.reduce((sum, c) => sum + c.matchPercent, 0) / competitors.length,
        );

  const lowest = [...competitors].sort((a, b) => a.matchPercent - b.matchPercent)[0];
  const summary =
    selected.size === 0
      ? "Add features to compare your draft against Monzo, Starling, and Revolut."
      : overallScore >= 75
        ? `Strong digital proposition — ${overallScore}% average parity with neobank benchmarks.`
        : `Your draft covers ${overallScore}% of typical neobank features on average. Biggest gap vs ${lowest?.label ?? "competitors"} (${lowest?.matchPercent ?? 0}% match).`;

  return {
    summary,
    overallScore,
    competitors,
    commonGaps,
    engine: "rules",
  };
}
