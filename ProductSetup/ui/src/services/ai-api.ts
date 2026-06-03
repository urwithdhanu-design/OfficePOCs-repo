import type { ProductData } from "@/types/product";
import type {
  ApprovalCopilotResponse,
  AssistantChatResponse,
  AssistantMessage,
  BenchmarkResponse,
  RecommendationsResponse,
} from "@/types/ai";

const API_BASE = import.meta.env.VITE_AI_API_URL ?? "";

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function sendAssistantMessage(
  message: string,
  productData: ProductData,
  conversationHistory?: AssistantMessage[],
): Promise<AssistantChatResponse> {
  const res = await fetch(`${API_BASE}/api/ai/assistant/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, productData, conversationHistory }),
  });
  return parseJson<AssistantChatResponse>(res);
}

export async function fetchFeatureRecommendations(
  productData: ProductData,
): Promise<RecommendationsResponse> {
  const res = await fetch(`${API_BASE}/api/ai/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productData }),
  });
  return parseJson<RecommendationsResponse>(res);
}

export async function fetchCompetitiveBenchmark(
  productData: ProductData,
): Promise<BenchmarkResponse> {
  const res = await fetch(`${API_BASE}/api/ai/benchmark`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productData }),
  });
  return parseJson<BenchmarkResponse>(res);
}

export async function fetchApprovalCopilot(
  productData: ProductData,
  options?: { previousProductData?: ProductData; submittedBy?: string },
): Promise<ApprovalCopilotResponse> {
  const res = await fetch(`${API_BASE}/api/ai/approval/copilot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productData,
      previousProductData: options?.previousProductData,
      submittedBy: options?.submittedBy,
    }),
  });
  return parseJson<ApprovalCopilotResponse>(res);
}
