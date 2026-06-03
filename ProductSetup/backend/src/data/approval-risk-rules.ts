/** Risk patterns flagged during product approval review */

export interface ApprovalRiskRule {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  /** All must be present to trigger (unless noted) */
  requires?: string[];
  /** If any present, rule is skipped */
  unless?: string[];
  /** Custom check description for plain-English output */
  reason: string;
  /** Optional: trigger only when feature has value matching */
  featureValueCheck?: {
    featureId: string;
    /** Treat as "high" if value parses above this (for APR etc.) */
    numericAbove?: number;
  };
}

export const APPROVAL_RISK_RULES: ApprovalRiskRule[] = [
  {
    id: "apr-no-fraud",
    severity: "high",
    requires: ["purchase-apr"],
    unless: ["fraud-protection"],
    reason:
      "Purchase APR is configured but Fraud Protection is missing — high-interest products should include 24/7 fraud monitoring.",
    featureValueCheck: { featureId: "purchase-apr", numericAbove: 15 },
  },
  {
    id: "cash-advance-no-fraud",
    severity: "high",
    requires: ["cash-advance"],
    unless: ["fraud-protection"],
    reason:
      "Cash Advance is enabled without Fraud Protection — withdrawal products carry elevated fraud and conduct risk.",
  },
  {
    id: "digital-no-3ds",
    severity: "medium",
    requires: ["virtual-cards", "instant-notifications"],
    unless: ["3d-secure", "fraud-protection"],
    reason:
      "Digital-first features (virtual cards, instant alerts) are enabled without 3D Secure or Fraud Protection.",
  },
  {
    id: "overlimit-no-alerts",
    severity: "medium",
    requires: ["overlimit-facility"],
    unless: ["account-alerts"],
    reason:
      "Overlimit Facility is offered without Account Alerts — customers may exceed limits without timely notification.",
  },
  {
    id: "crypto-no-education",
    severity: "medium",
    requires: ["crypto-purchases"],
    unless: ["financial-education"],
    reason:
      "Cryptocurrency purchases are enabled without Financial Education content — regulatory disclosure gap.",
  },
  {
    id: "bt-no-direct-debit",
    severity: "medium",
    requires: ["bt-promotional-rate"],
    unless: ["direct-debit"],
    reason:
      "Promotional balance transfer rate without Direct Debit — repayment discipline and arrears risk.",
  },
  {
    id: "premium-travel-no-insurance",
    severity: "medium",
    requires: ["airport-lounge"],
    unless: ["travel-insurance"],
    reason:
      "Airport Lounge Access without Travel Insurance — premium travel propositions typically bundle both.",
  },
  {
    id: "gambling-block-missing-controls",
    severity: "medium",
    requires: ["merchant-blocking"],
    unless: ["gambling-block", "spending-controls"],
    reason:
      "Merchant blocking is enabled but neither Gambling Block nor Spending Controls — incomplete vulnerable-customer controls.",
  },
  {
    id: "no-fraud-digital-heavy",
    severity: "high",
    requires: ["instant-notifications", "freeze-card", "virtual-cards"],
    unless: ["fraud-protection"],
    reason:
      "Heavy digital feature set without Fraud Protection — elevated exposure for card-not-present and APP fraud.",
  },
  {
    id: "paperless-statement-conflict",
    severity: "low",
    requires: ["paperless-statements", "statement-default"],
    reason:
      "Paperless Statements combined with Default Statement Setting — clarify customer communication defaults before approval.",
  },
  {
    id: "zero-fx-with-foreign-fee",
    severity: "high",
    requires: ["zero-fx-fees", "foreign-transaction-fee"],
    reason:
      "Zero FX Fees and Foreign Transaction Fee both enabled — contradictory pricing that will confuse customers and operations.",
  },
  {
    id: "cardholders-mismatch",
    severity: "low",
    requires: [],
    reason:
      "Additional cardholders count is set but Additional Cardholders feature is not enabled — configuration inconsistency.",
  },
];
