/** Mirrors featureflow-builder/src/types/product.ts */

export type Brand = "lloyds" | "halifax" | "bos" | "mbna";

export interface ProductFeature {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  value?: string;
  notes?: string;
  effectiveDate?: string;
  priority?: number;
}

export interface ExternalSystemId {
  system: string;
  id: string;
  name?: string;
}

export interface ProductData {
  productName: string;
  brands: Brand[];
  additionalCardholders: number;
  features: ProductFeature[];
  externalSystems: ExternalSystemId[];
}

export type RecommendationType =
  | "missing"
  | "complementary"
  | "conflict"
  | "redundant"
  | "compliance";

export interface FeatureRecommendation {
  type: RecommendationType;
  featureIds: string[];
  title: string;
  reason: string;
  severity: "info" | "warning" | "error";
  /** Suggested action for the UI */
  action?: "add" | "remove" | "review";
}

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantChatRequest {
  message: string;
  productData: ProductData;
  conversationHistory?: AssistantMessage[];
}

export interface AssistantChatResponse {
  reply: string;
  productData: ProductData;
  featuresAdded: ProductFeature[];
  featuresRemoved: string[];
  suggestions: FeatureRecommendation[];
  /** How the response was produced */
  engine: "openai" | "rules";
}

export interface RecommendationsRequest {
  productData: ProductData;
  /** Approved product snapshots for similarity matching (optional) */
  approvedProducts?: ProductData[];
}

export interface RecommendationsResponse {
  recommendations: FeatureRecommendation[];
  summary: string;
  engine: "openai" | "rules";
}

export type CompetitorId = "monzo" | "starling" | "revolut";

export interface BenchmarkGap {
  featureId: string;
  featureName: string;
  category: string;
  reason: string;
}

export interface CompetitorBenchmark {
  competitor: CompetitorId;
  label: string;
  tagline: string;
  matchPercent: number;
  presentCount: number;
  totalBenchmarkFeatures: number;
  gaps: BenchmarkGap[];
  strengths: Array<{ featureId: string; featureName: string }>;
}

export interface BenchmarkResponse {
  summary: string;
  overallScore: number;
  competitors: CompetitorBenchmark[];
  commonGaps: Array<{
    featureId: string;
    featureName: string;
    missingFrom: CompetitorId[];
  }>;
  engine: "openai" | "rules";
}

export type ApprovalRecommendation = "approve" | "review_carefully" | "reject_or_rework";

export interface ApprovalRiskFlag {
  ruleId: string;
  severity: "high" | "medium" | "low";
  title: string;
  reason: string;
}

export interface ApprovalCopilotRequest {
  productData: ProductData;
  previousProductData?: ProductData;
  submittedBy?: string;
}

export interface ApprovalCopilotResponse {
  plainEnglishSummary: string;
  changeSummary: string[];
  riskFlags: ApprovalRiskFlag[];
  recommendation: ApprovalRecommendation;
  draftApprovalRationale: string;
  draftRejectionRationale: string;
  engine: "openai" | "rules";
}
