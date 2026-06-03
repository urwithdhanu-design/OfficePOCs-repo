import type { Brand } from "../types/product.js";

/**
 * Domain knowledge for smart recommendations and the configuration assistant.
 * Pairs, conflicts, and compliance rules align with banking product setup practice.
 */

/** Features commonly enabled together on similar products */
export const COMPLEMENTARY_PAIRS: Array<{
  trigger: string;
  suggest: string;
  reason: string;
}> = [
  {
    trigger: "cashback-rewards",
    suggest: "spending-insights",
    reason:
      "Most premium and rewards cards pair Cashback with AI-Powered Spending Insights so customers can track reward-eligible spend.",
  },
  {
    trigger: "cashback-rewards",
    suggest: "budgeting-tools",
    reason: "Cashback products typically include budgeting tools to help customers maximise rewards.",
  },
  {
    trigger: "points-rewards",
    suggest: "spending-insights",
    reason: "Points programmes are usually bundled with spending insights for redemption planning.",
  },
  {
    trigger: "travel-miles",
    suggest: "travel-insurance",
    reason: "Travel miles cards almost always include complimentary travel insurance.",
  },
  {
    trigger: "airport-lounge",
    suggest: "concierge-service",
    reason: "Lounge access is standard on premium travel cards alongside concierge service.",
  },
  {
    trigger: "zero-fx-fees",
    suggest: "multi-currency",
    reason: "Zero FX fee products typically offer multi-currency wallets or accounts.",
  },
  {
    trigger: "gambling-block",
    suggest: "spending-controls",
    reason:
      "Cards with Gambling Block usually also have Advanced Spending Controls for broader category limits.",
  },
  {
    trigger: "gambling-block",
    suggest: "merchant-blocking",
    reason: "Gambling blocks are often implemented alongside merchant category blocking.",
  },
  {
    trigger: "merchant-blocking",
    suggest: "spending-controls",
    reason: "Merchant blocking works best when paired with granular spending controls.",
  },
  {
    trigger: "freeze-card",
    suggest: "instant-notifications",
    reason: "Instant freeze/unfreeze is typically paired with real-time transaction notifications.",
  },
  {
    trigger: "virtual-cards",
    suggest: "3d-secure",
    reason: "Virtual card products should include 3D Secure for online purchase protection.",
  },
  {
    trigger: "bnpl-integration",
    suggest: "spending-summary",
    reason: "BNPL integrations usually include spending summaries so customers can manage instalments.",
  },
];

/** Mutually exclusive or redundant combinations */
export const CONFLICTS: Array<{
  featureIds: string[];
  reason: string;
}> = [
  {
    featureIds: ["paperless-statements", "statement-default"],
    reason:
      'Paperless Statements and Default Statement Setting can conflict — clarify whether paper or electronic is the default.',
  },
  {
    featureIds: ["paperless-statements", "statement-option"],
    reason:
      "Paperless-only products may not need separate Statement Delivery Options unless hybrid delivery is supported.",
  },
  {
    featureIds: ["zero-fx-fees", "foreign-transaction-fee"],
    reason: "Zero FX fees contradict a Foreign Transaction Fee feature — choose one pricing model.",
  },
  {
    featureIds: ["atm-only-mode", "online-only-mode"],
    reason: "ATM-Only Mode and Online-Only Mode cannot both be active — they restrict different channel types.",
  },
  {
    featureIds: ["cashback-rewards", "points-rewards"],
    reason:
      "Most products use a single rewards mechanic — Cashback and Points together may confuse customers unless this is a hybrid tier.",
  },
];

/** Compliance / regulatory patterns */
export const COMPLIANCE_RULES: Array<{
  requiredIf: string[];
  suggest: string;
  reason: string;
}> = [
  {
    requiredIf: ["gambling-block"],
    suggest: "spending-controls",
    reason:
      "Regulatory best practice: cards with Gambling Block should also offer Spending Controls for vulnerable customer protection.",
  },
  {
    requiredIf: ["crypto-purchases"],
    suggest: "financial-education",
    reason: "Crypto-enabled cards typically include financial education content for risk disclosure.",
  },
  {
    requiredIf: ["overlimit-facility"],
    suggest: "account-alerts",
    reason: "Overlimit facilities should be paired with account alerts so customers are notified promptly.",
  },
];

/**
 * Intent templates for natural-language configuration (rule engine).
 * Keywords are matched case-insensitively against user message + product name.
 */
export const INTENT_PROFILES: Array<{
  id: string;
  keywords: string[];
  productNameHint?: string;
  brands?: Brand[];
  featureIds: string[];
  description: string;
}> = [
  {
    id: "premium-travel",
    keywords: ["premium", "travel", "lounge", "fx", "no fx", "foreign exchange", "international"],
    productNameHint: "Premium Travel",
    brands: ["lloyds"],
    featureIds: [
      "zero-fx-fees",
      "airport-lounge",
      "travel-insurance",
      "concierge-service",
      "travel-miles",
      "purchase-protection",
      "fraud-protection",
      "3d-secure",
      "contactless-payment",
      "apple-pay",
      "google-pay",
      "spending-insights",
      "instant-notifications",
      "freeze-card",
    ],
    description: "Premium travel card with no FX fees and lounge access",
  },
  {
    id: "rewards-cashback",
    keywords: ["cashback", "rewards", "everyday", "standard rewards"],
    productNameHint: "Cashback Rewards",
    featureIds: [
      "cashback-rewards",
      "spending-insights",
      "budgeting-tools",
      "account-alerts",
      "mobile-app-access",
      "paperless-statements",
    ],
    description: "Cashback rewards card with digital insights",
  },
  {
    id: "digital-neobank",
    keywords: ["digital", "app-first", "monzo", "modern", "fintech", "neobank"],
    productNameHint: "Digital First",
    featureIds: [
      "instant-notifications",
      "freeze-card",
      "virtual-cards",
      "spending-controls",
      "pots-savings",
      "round-up-savings",
      "biometric-auth",
      "open-banking-payments",
    ],
    description: "Digital-first card with modern app features",
  },
  {
    id: "balance-transfer",
    keywords: ["balance transfer", "bt ", "0% interest", "interest free"],
    productNameHint: "Balance Transfer",
    featureIds: [
      "bt-enabled",
      "bt-promotional-rate",
      "interest-free-period",
      "balance-transfer-fee",
      "direct-debit",
    ],
    description: "Balance transfer promotional product",
  },
  {
    id: "responsible-lending",
    keywords: [
      "responsible spending",
      "responsible",
      "gambling",
      "vulnerable",
      "controls",
      "spending controls",
      "spending control",
      "block gambling",
    ],
    productNameHint: "Responsible Spending",
    featureIds: [
      "gambling-block",
      "merchant-blocking",
      "spending-controls",
      "account-alerts",
      "financial-education",
    ],
    description: "Card focused on spending controls and gambling blocks",
  },
  {
    id: "premium-lifestyle",
    keywords: ["lifestyle", "perks", "concierge", "insurance", "warranty"],
    productNameHint: "Premium Lifestyle",
    featureIds: [
      "perks-program",
      "concierge-service",
      "extended-warranty",
      "purchase-protection",
      "annual-fee",
    ],
    description: "Premium lifestyle benefits package",
  },
];

/** Sample approved products for similarity-based missing-feature suggestions */
export const SAMPLE_APPROVED_PRODUCTS: Array<{
  name: string;
  featureIds: string[];
}> = [
  {
    name: "Lloyds Platinum Travel",
    featureIds: [
      "zero-fx-fees",
      "airport-lounge",
      "travel-insurance",
      "concierge-service",
      "travel-miles",
      "fraud-protection",
      "spending-insights",
      "instant-notifications",
    ],
  },
  {
    name: "Halifax Cashback Plus",
    featureIds: [
      "cashback-rewards",
      "spending-insights",
      "budgeting-tools",
      "account-alerts",
      "paperless-statements",
      "mobile-app-access",
    ],
  },
  {
    name: "MBNA Premium Rewards",
    featureIds: [
      "points-rewards",
      "purchase-protection",
      "extended-warranty",
      "travel-insurance",
      "3d-secure",
      "fraud-protection",
    ],
  },
  {
    name: "BoS Digital Everyday",
    featureIds: [
      "instant-notifications",
      "freeze-card",
      "virtual-cards",
      "spending-controls",
      "round-up-savings",
      "biometric-auth",
    ],
  },
];
