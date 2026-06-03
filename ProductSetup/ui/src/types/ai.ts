import type { ProductData, ProductFeature } from "./product";

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
  action?: "add" | "remove" | "review";
}

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantChatResponse {
  reply: string;
  productData: ProductData;
  featuresAdded: ProductFeature[];
  featuresRemoved: string[];
  suggestions: FeatureRecommendation[];
  engine: "openai" | "rules";
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  summary: string;
  engine: "openai" | "rules";
}

// Alias for clarity in components
export type Recommendation = FeatureRecommendation;

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

export interface ApprovalCopilotResponse {
  plainEnglishSummary: string;
  changeSummary: string[];
  riskFlags: ApprovalRiskFlag[];
  recommendation: ApprovalRecommendation;
  draftApprovalRationale: string;
  draftRejectionRationale: string;
  engine: "openai" | "rules";
}
