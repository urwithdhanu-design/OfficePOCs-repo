/** Typical digital-first card feature sets for competitive benchmarking (POC profiles). */

export type CompetitorId = "monzo" | "starling" | "revolut";

export interface CompetitorProfile {
  id: CompetitorId;
  label: string;
  tagline: string;
  /** Core features customers expect from this brand's card/app proposition */
  featureIds: string[];
  /** Short note per feature — why it's associated with this competitor */
  featureNotes: Record<string, string>;
}

export const COMPETITOR_PROFILES: CompetitorProfile[] = [
  {
    id: "monzo",
    label: "Monzo",
    tagline: "App-first everyday banking with Pots, Flex BNPL, and real-time controls",
    featureIds: [
      "instant-notifications",
      "freeze-card",
      "virtual-cards",
      "spending-controls",
      "merchant-blocking",
      "pots-savings",
      "round-up-savings",
      "spending-insights",
      "budgeting-tools",
      "bill-splitting",
      "subscription-management",
      "bnpl-integration",
      "open-banking-payments",
      "gambling-block",
      "biometric-auth",
      "account-alerts",
    ],
    featureNotes: {
      "instant-notifications": "Real-time push alerts on every transaction",
      "freeze-card": "Instant freeze/unfreeze in-app",
      "virtual-cards": "Disposable virtual cards for online shopping",
      "pots-savings": "Savings Pots for goal-based saving",
      "round-up-savings": "Round-up spare change into Pots",
      "bnpl-integration": "Monzo Flex — integrated BNPL",
      "bill-splitting": "Split bills with contacts in-app",
      "gambling-block": "Optional gambling merchant blocks",
    },
  },
  {
    id: "starling",
    label: "Starling",
    tagline: "Digital current account with Spaces, ethical banking, and strong spending tools",
    featureIds: [
      "instant-notifications",
      "freeze-card",
      "spending-controls",
      "merchant-blocking",
      "pots-savings",
      "round-up-savings",
      "spending-insights",
      "budgeting-tools",
      "bill-splitting",
      "open-banking-payments",
      "biometric-auth",
      "carbon-tracking",
      "charity-roundup",
      "gambling-block",
      "account-alerts",
      "receipt-capture",
    ],
    featureNotes: {
      "pots-savings": "Spaces for ring-fenced savings",
      "carbon-tracking": "Carbon footprint insights on spending",
      "charity-roundup": "Round-up donations to charity",
      "receipt-capture": "Attach receipts to transactions",
      "bill-splitting": "Settle up with friends via the app",
    },
  },
  {
    id: "revolut",
    label: "Revolut",
    tagline: "Multi-currency, travel-friendly, premium tiers with crypto and lifestyle perks",
    featureIds: [
      "instant-notifications",
      "freeze-card",
      "virtual-cards",
      "multi-currency",
      "zero-fx-fees",
      "spending-controls",
      "merchant-blocking",
      "crypto-purchases",
      "budgeting-tools",
      "subscription-management",
      "open-banking-payments",
      "round-up-savings",
      "biometric-auth",
      "gambling-block",
      "airport-lounge",
      "travel-insurance",
      "purchase-protection",
    ],
    featureNotes: {
      "multi-currency": "Hold and exchange multiple currencies",
      "zero-fx-fees": "No FX markup on international spend (tier-dependent)",
      "crypto-purchases": "Buy/sell crypto in-app",
      "airport-lounge": "Lounge access on Metal/Premium tiers",
      "virtual-cards": "Single-use virtual cards for online payments",
    },
  },
];
