import { APPROVAL_RISK_RULES } from "../data/approval-risk-rules.js";
import type {
  ApprovalCopilotRequest,
  ApprovalCopilotResponse,
  ApprovalRiskFlag,
  ProductData,
  ProductFeature,
} from "../types/product.js";

function selectedIds(data: ProductData): Set<string> {
  return new Set(data.features.map((f) => f.id));
}

function featureMap(data: ProductData): Map<string, ProductFeature> {
  return new Map(data.features.map((f) => [f.id, f]));
}

function parseAprValue(feature?: ProductFeature): number | null {
  if (!feature?.value) return null;
  const n = parseFloat(feature.value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function evaluateApprovalRisks(productData: ProductData): ApprovalRiskFlag[] {
  const ids = selectedIds(productData);
  const features = featureMap(productData);
  const flags: ApprovalRiskFlag[] = [];

  for (const rule of APPROVAL_RISK_RULES) {
    if (rule.id === "cardholders-mismatch") {
      if (productData.additionalCardholders > 0 && !ids.has("additional-cardholder")) {
        flags.push({
          ruleId: rule.id,
          severity: rule.severity,
          title: rule.title || "Configuration inconsistency",
          reason: rule.reason,
        });
      }
      continue;
    }

    const requiresMet = (rule.requires ?? []).every((id) => ids.has(id));
    if (!requiresMet) continue;

    const unlessBlocked = (rule.unless ?? []).some((id) => ids.has(id));
    if (unlessBlocked) continue;

    if (rule.featureValueCheck) {
      const feat = features.get(rule.featureValueCheck.featureId);
      if (!feat) continue;
      const val = parseAprValue(feat);
      if (rule.featureValueCheck.numericAbove != null && val != null) {
        if (val <= rule.featureValueCheck.numericAbove) continue;
      } else if (rule.featureValueCheck.numericAbove != null && val == null) {
        // APR feature present but no numeric value — still flag if requires met
      }
    }

    flags.push({
      ruleId: rule.id,
      severity: rule.severity,
      title: ruleTitle(rule.id),
      reason: rule.reason,
    });
  }

  return flags.sort(
    (a, b) => severityRank(b.severity) - severityRank(a.severity),
  );
}

function ruleTitle(ruleId: string): string {
  const titles: Record<string, string> = {
    "apr-no-fraud": "High APR without fraud protection",
    "cash-advance-no-fraud": "Cash advance without fraud protection",
    "digital-no-3ds": "Digital features without online security",
    "overlimit-no-alerts": "Overlimit without customer alerts",
    "crypto-no-education": "Crypto without financial education",
    "bt-no-direct-debit": "Balance transfer without direct debit",
    "premium-travel-no-insurance": "Premium travel without insurance",
    "gambling-block-missing-controls": "Incomplete spending controls",
    "no-fraud-digital-heavy": "Digital-heavy product without fraud protection",
    "paperless-statement-conflict": "Statement delivery conflict",
    "zero-fx-with-foreign-fee": "Contradictory FX pricing",
    "cardholders-mismatch": "Cardholder configuration mismatch",
  };
  return titles[ruleId] ?? "Configuration risk";
}

function severityRank(s: ApprovalRiskFlag["severity"]): number {
  return s === "high" ? 3 : s === "medium" ? 2 : 1;
}

export function summarizeVersionChanges(
  current: ProductData,
  previous?: ProductData,
): string[] {
  if (!previous) {
    return [
      `New submission: "${current.productName}" with ${current.features.length} feature(s) across ${current.brands.length} brand(s).`,
      "No prior version was provided for comparison — review the full configuration below.",
    ];
  }

  const lines: string[] = [];
  const prevIds = selectedIds(previous);
  const currIds = selectedIds(current);

  if (current.productName !== previous.productName) {
    lines.push(
      `Product renamed from "${previous.productName}" to "${current.productName}".`,
    );
  }

  const prevBrands = [...previous.brands].sort().join(", ");
  const currBrands = [...current.brands].sort().join(", ");
  if (prevBrands !== currBrands) {
    lines.push(`Brands changed from [${prevBrands || "none"}] to [${currBrands || "none"}].`);
  }

  if (current.additionalCardholders !== previous.additionalCardholders) {
    lines.push(
      `Additional cardholders updated from ${previous.additionalCardholders} to ${current.additionalCardholders}.`,
    );
  }

  const added = current.features.filter((f) => !prevIds.has(f.id));
  const removed = previous.features.filter((f) => !currIds.has(f.id));

  if (added.length > 0) {
    lines.push(
      `Added ${added.length} feature(s): ${added.map((f) => f.name).join(", ")}.`,
    );
  }
  if (removed.length > 0) {
    lines.push(
      `Removed ${removed.length} feature(s): ${removed.map((f) => f.name).join(", ")}.`,
    );
  }

  const currMap = featureMap(current);
  for (const prev of previous.features) {
    const curr = currMap.get(prev.id);
    if (!curr) continue;
    const changes: string[] = [];
    if (prev.value !== curr.value && (prev.value || curr.value)) {
      changes.push(`value "${prev.value ?? "empty"}" → "${curr.value ?? "empty"}"`);
    }
    if (prev.priority !== curr.priority) {
      changes.push(`priority ${prev.priority ?? "—"} → ${curr.priority ?? "—"}`);
    }
    if (changes.length > 0) {
      lines.push(`Updated ${curr.name}: ${changes.join("; ")}.`);
    }
  }

  const prevSystems = previous.externalSystems.filter((s) => s.id).length;
  const currSystems = current.externalSystems.filter((s) => s.id).length;
  if (prevSystems !== currSystems) {
    lines.push(
      `External system mappings changed (${prevSystems} → ${currSystems} configured).`,
    );
  }

  if (lines.length === 0) {
    lines.push("No material changes detected compared to the previous version.");
  }

  return lines;
}

function draftApprovalRationale(
  productData: ProductData,
  flags: ApprovalRiskFlag[],
  changeSummary: string[],
): string {
  const high = flags.filter((f) => f.severity === "high");
  const medium = flags.filter((f) => f.severity === "medium");

  if (high.length > 0) {
    return [
      `Recommend rejection or return for rework on "${productData.productName}".`,
      "",
      "Primary concerns:",
      ...high.map((f) => `• ${f.reason}`),
      ...(medium.length > 0 ? ["", "Additional items to address:", ...medium.map((f) => `• ${f.reason}`)] : []),
      "",
      "Please resolve the above before resubmitting for approval.",
    ].join("\n");
  }

  const brandLabels = productData.brands.join(", ") || "unspecified brands";
  return [
    `Recommend approval for "${productData.productName}" (${brandLabels}).`,
    "",
    `The configuration includes ${productData.features.length} features with ${medium.length} medium-risk item(s) noted for post-launch monitoring.`,
    ...(medium.length > 0 ? ["", "Monitor:", ...medium.map((f) => `• ${f.reason}`)] : []),
    "",
    changeSummary.length > 0 ? `Summary: ${changeSummary[0]}` : "",
    "",
    "Configuration aligns with standard product setup controls and is suitable to proceed.",
  ]
    .filter(Boolean)
    .join("\n");
}

function draftRejectionRationale(
  productData: ProductData,
  flags: ApprovalRiskFlag[],
  changeSummary: string[],
): string {
  const all = flags.length > 0 ? flags : [{ reason: "Configuration requires business review before go-live.", severity: "medium" as const, title: "Review required", ruleId: "generic" }];

  return [
    `"${productData.productName}" is not approved at this time.`,
    "",
    "Reason(s) for rejection:",
    ...all.slice(0, 5).map((f) => `• ${f.reason}`),
    "",
    ...(changeSummary.length > 0 ? ["Changes in this version:", ...changeSummary.map((l) => `• ${l}`), ""] : []),
    "Please update the configuration and resubmit when items are resolved.",
  ].join("\n");
}

export function runApprovalCopilot(
  request: ApprovalCopilotRequest,
): ApprovalCopilotResponse {
  const { productData, previousProductData } = request;
  const changeSummary = summarizeVersionChanges(productData, previousProductData);
  const riskFlags = evaluateApprovalRisks(productData);
  const highCount = riskFlags.filter((f) => f.severity === "high").length;
  const mediumCount = riskFlags.filter((f) => f.severity === "medium").length;

  const recommendation: ApprovalCopilotResponse["recommendation"] =
    highCount > 0 ? "reject_or_rework" : mediumCount >= 3 ? "review_carefully" : "approve";

  const plainEnglishSummary =
    changeSummary.length === 1
      ? changeSummary[0]
      : `${changeSummary[0]} ${changeSummary.length > 1 ? `Plus ${changeSummary.length - 1} other change(s).` : ""}`;

  return {
    plainEnglishSummary,
    changeSummary,
    riskFlags,
    recommendation,
    draftApprovalRationale: draftApprovalRationale(productData, riskFlags, changeSummary),
    draftRejectionRationale: draftRejectionRationale(productData, riskFlags, changeSummary),
    engine: "rules",
  };
}

/** Resolve prior submission for the same product name from a list of records */
export function findPreviousProductData(
  productData: ProductData,
  history: ProductData[],
): ProductData | undefined {
  return history.find(
    (p) =>
      p.productName.toLowerCase() === productData.productName.toLowerCase() &&
      JSON.stringify(p) !== JSON.stringify(productData),
  );
}
