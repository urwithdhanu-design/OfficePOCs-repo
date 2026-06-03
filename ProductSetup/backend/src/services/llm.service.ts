import type { AssistantChatRequest, AssistantChatResponse } from "../types/product.js";
import { getCatalog, mergeFeatures, resolveFeatures } from "./catalog.service.js";
import { runConfigurationAssistant } from "./configuration-assistant.service.js";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export function isLlmEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.AI_MODE !== "rules");
}

/**
 * Optional OpenAI path: returns structured JSON for product updates.
 * Falls back to rule engine on any failure.
 */
export async function runAssistantWithLlm(
  request: AssistantChatRequest,
): Promise<AssistantChatResponse> {
  if (!isLlmEnabled()) {
    return runConfigurationAssistant(request);
  }

  const apiKey = process.env.OPENAI_API_KEY!;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const catalog = getCatalog();

  const systemPrompt = `You are an AI Product Configuration Assistant for a UK credit card product setup wizard (Lloyds Banking Group POC).
Given a user message and current product JSON, respond with JSON only:
{
  "reply": "markdown string for the user",
  "productName": "string",
  "brands": ["lloyds"|"halifax"|"bos"|"mbna"],
  "featureIdsToAdd": ["catalog-id", ...],
  "featureIdsToRemove": ["catalog-id", ...]
}
Only use feature IDs from this catalog: ${JSON.stringify(catalog.map((f) => ({ id: f.id, name: f.name, category: f.category })))}.
Suggest complementary features when appropriate. Mention conflicts if user selects incompatible pairs.`;

  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: JSON.stringify({
              message: request.message,
              productData: request.productData,
              history: request.conversationHistory ?? [],
            }),
          },
        ],
      }),
    });

    if (!res.ok) {
      console.warn("OpenAI request failed:", res.status, await res.text());
      return runConfigurationAssistant(request);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return runConfigurationAssistant(request);

    const parsed = JSON.parse(content) as {
      reply?: string;
      productName?: string;
      brands?: string[];
      featureIdsToAdd?: string[];
      featureIdsToRemove?: string[];
    };

    const base = runConfigurationAssistant(request);
    const removeSet = new Set(parsed.featureIdsToRemove ?? []);
    const toAdd = parsed.featureIdsToAdd ?? base.featuresAdded.map((f) => f.id);

    const added = resolveFeatures(
      toAdd.filter((id) => !base.productData.features.some((f) => f.id === id)),
    );
    let features = mergeFeatures(base.productData.features, added).filter((f) => !removeSet.has(f.id));

    return {
      ...base,
      reply: parsed.reply ?? base.reply,
      productData: {
        ...base.productData,
        productName: parsed.productName ?? base.productData.productName,
        brands: (parsed.brands as typeof base.productData.brands) ?? base.productData.brands,
        features,
      },
      featuresAdded: added,
      featuresRemoved: [...removeSet],
      engine: "openai",
    };
  } catch (err) {
    console.warn("LLM assistant error:", err);
    return runConfigurationAssistant(request);
  }
}
