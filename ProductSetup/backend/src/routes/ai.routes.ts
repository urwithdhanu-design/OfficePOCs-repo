import { Router } from "express";
import { z } from "zod";
import { runConfigurationAssistant } from "../services/configuration-assistant.service.js";
import { isLlmEnabled, runAssistantWithLlm } from "../services/llm.service.js";
import { buildRecommendations } from "../services/recommendations.service.js";
import { buildCompetitiveBenchmark } from "../services/benchmark.service.js";
import { runApprovalCopilot } from "../services/approval-copilot.service.js";
import { getCatalog } from "../services/catalog.service.js";

const brandSchema = z.enum(["lloyds", "halifax", "bos", "mbna"]);

const productFeatureSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  value: z.string().optional(),
  notes: z.string().optional(),
  effectiveDate: z.string().optional(),
  priority: z.number().optional(),
});

const productDataSchema = z.object({
  productName: z.string(),
  brands: z.array(brandSchema),
  additionalCardholders: z.number(),
  features: z.array(productFeatureSchema),
  externalSystems: z.array(
    z.object({
      system: z.string(),
      id: z.string(),
      name: z.string().optional(),
    }),
  ),
});

const assistantChatSchema = z.object({
  message: z.string().min(1),
  productData: productDataSchema,
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .optional(),
});

const recommendationsSchema = z.object({
  productData: productDataSchema,
  approvedProducts: z.array(productDataSchema).optional(),
});

const approvalCopilotSchema = z.object({
  productData: productDataSchema,
  previousProductData: productDataSchema.optional(),
  submittedBy: z.string().optional(),
});

export const aiRouter = Router();

/**
 * AI Product Configuration Assistant
 * Natural-language wizard helper — selects catalog features and suggests complements.
 */
aiRouter.post("/assistant/chat", async (req, res, next) => {
  try {
    const body = assistantChatSchema.parse(req.body);
    const result = await runAssistantWithLlm(body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * Smart Feature Recommendations (Features step)
 * Missing, complementary, conflict, and compliance insights.
 */
aiRouter.post("/recommendations", (req, res, next) => {
  try {
    const body = recommendationsSchema.parse(req.body);
    const result = buildRecommendations(body.productData, body.approvedProducts);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * Competitive Benchmarking — compare draft config vs Monzo / Starling / Revolut profiles.
 */
aiRouter.post("/benchmark", (req, res, next) => {
  try {
    const body = recommendationsSchema.parse(req.body);
    res.json(buildCompetitiveBenchmark(body.productData));
  } catch (e) {
    next(e);
  }
});

/**
 * Approval Workflow Co-Pilot — version summary, risk flags, draft rationale.
 */
aiRouter.post("/approval/copilot", (req, res, next) => {
  try {
    const body = approvalCopilotSchema.parse(req.body);
    res.json(runApprovalCopilot(body));
  } catch (e) {
    next(e);
  }
});

/** Lightweight sync endpoint for health checks / engine probe */
aiRouter.get("/assistant/status", (_req, res) => {
  res.json({
    assistant: "AI Product Configuration Assistant",
    recommendations: "Smart Feature Recommendations",
    benchmarking: "Competitive Benchmarking (Monzo / Starling / Revolut)",
    approvalCopilot: "Approval Workflow Co-Pilot",
    engine: isLlmEnabled() ? "openai" : "rules",
    catalogSize: getCatalog().length,
  });
});

/** Dev-only: rule engine without LLM round-trip */
aiRouter.post("/assistant/chat/rules", (req, res, next) => {
  try {
    const body = assistantChatSchema.parse(req.body);
    res.json(runConfigurationAssistant(body));
  } catch (e) {
    next(e);
  }
});
