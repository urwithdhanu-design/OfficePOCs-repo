import { describe, expect, it } from "vitest";
import { getCatalog } from "../catalog.service.js";
import { runConfigurationAssistant } from "../configuration-assistant.service.js";
import { buildRecommendations } from "../recommendations.service.js";
import { buildCompetitiveBenchmark } from "../benchmark.service.js";
import { runApprovalCopilot, summarizeVersionChanges, evaluateApprovalRisks } from "../approval-copilot.service.js";
import type { ProductData } from "../../types/product.js";

const emptyProduct = (): ProductData => ({
  productName: "",
  brands: [],
  additionalCardholders: 0,
  features: [],
  externalSystems: [],
});

describe("catalog", () => {
  it("loads 79 features from JSON", () => {
    expect(getCatalog().length).toBe(79);
  });
});

describe("configuration assistant", () => {
  it("configures premium travel card from natural language", () => {
    const result = runConfigurationAssistant({
      message:
        "Set up a premium travel card for Lloyds with no FX fees and lounge access",
      productData: emptyProduct(),
    });

    expect(result.productData.brands).toContain("lloyds");
    expect(result.featuresAdded.map((f) => f.id)).toContain("zero-fx-fees");
    expect(result.featuresAdded.map((f) => f.id)).toContain("airport-lounge");
    expect(result.reply).toMatch(/premium travel/i);
    expect(result.engine).toBe("rules");
  });

  it("configures responsible spending card for all brands", () => {
    const result = runConfigurationAssistant({
      message: "Configure responsible spending card for all brands",
      productData: emptyProduct(),
    });

    expect(result.productData.brands).toEqual(
      expect.arrayContaining(["lloyds", "halifax", "bos", "mbna"]),
    );
    expect(result.featuresAdded.map((f) => f.id)).toContain("gambling-block");
    expect(result.featuresAdded.map((f) => f.id)).toContain("spending-controls");
    expect(result.reply).not.toMatch(/couldn't map/i);
    expect(result.reply).toMatch(/responsible/i);
  });
});

describe("recommendations", () => {
  it("suggests spending insights when cashback is selected", () => {
    const cashback = getCatalog().find((f) => f.id === "cashback-rewards")!;
    const result = buildRecommendations({
      ...emptyProduct(),
      features: [cashback],
    });

    const complementary = result.recommendations.filter((r) => r.type === "complementary");
    expect(complementary.some((r) => r.featureIds.includes("spending-insights"))).toBe(true);
  });

  it("flags paperless + statement default conflict", () => {
    const paperless = getCatalog().find((f) => f.id === "paperless-statements")!;
    const stmtDefault = getCatalog().find((f) => f.id === "statement-default")!;
    const result = buildRecommendations({
      ...emptyProduct(),
      features: [paperless, stmtDefault],
    });

    expect(result.recommendations.some((r) => r.type === "conflict")).toBe(true);
  });

  it("flags compliance gap for gambling block without spending controls", () => {
    const gambling = getCatalog().find((f) => f.id === "gambling-block")!;
    const result = buildRecommendations({
      ...emptyProduct(),
      features: [gambling],
    });

    expect(
      result.recommendations.some(
        (r) => r.type === "compliance" && r.featureIds.includes("spending-controls"),
      ),
    ).toBe(true);
  });
});

describe("competitive benchmark", () => {
  it("reports gaps vs neobank profiles", () => {
    const freeze = getCatalog().find((f) => f.id === "freeze-card")!;
    const result = buildCompetitiveBenchmark({
      ...emptyProduct(),
      features: [freeze],
    });

    expect(result.competitors).toHaveLength(3);
    expect(result.competitors.every((c) => c.matchPercent < 100)).toBe(true);
    expect(result.competitors.some((c) => c.gaps.length > 0)).toBe(true);
    expect(result.overallScore).toBeGreaterThan(0);
  });

  it("identifies common gaps across multiple competitors", () => {
    const result = buildCompetitiveBenchmark({
      ...emptyProduct(),
      productName: "Minimal",
      features: [],
    });

    expect(result.commonGaps.length).toBeGreaterThan(0);
    expect(result.commonGaps[0].missingFrom.length).toBeGreaterThanOrEqual(2);
  });
});

describe("approval copilot", () => {
  it("summarizes feature changes between versions", () => {
    const prev = getCatalog().find((f) => f.id === "freeze-card")!;
    const added = getCatalog().find((f) => f.id === "fraud-protection")!;
    const summary = summarizeVersionChanges(
      {
        ...emptyProduct(),
        productName: "Digital Card",
        features: [prev, added],
      },
      {
        ...emptyProduct(),
        productName: "Basic Card",
        features: [prev],
      },
    );
    expect(summary.some((s) => s.includes("renamed"))).toBe(true);
    expect(summary.some((s) => s.includes("Fraud Protection"))).toBe(true);
  });

  it("flags high APR without fraud protection", () => {
    const apr = getCatalog().find((f) => f.id === "purchase-apr")!;
    const flags = evaluateApprovalRisks({
      ...emptyProduct(),
      features: [{ ...apr, value: "24.9%" }],
    });
    expect(flags.some((f) => f.ruleId === "apr-no-fraud" && f.severity === "high")).toBe(true);
  });

  it("drafts approval and rejection rationale", () => {
    const fraud = getCatalog().find((f) => f.id === "fraud-protection")!;
    const result = runApprovalCopilot({
      productData: { ...emptyProduct(), productName: "Safe Card", features: [fraud] },
    });
    expect(result.draftApprovalRationale).toMatch(/Recommend approval/i);
    expect(result.draftRejectionRationale).toMatch(/not approved/i);
    expect(result.recommendation).toBe("approve");
  });
});
