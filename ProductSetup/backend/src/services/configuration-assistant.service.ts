import { INTENT_PROFILES } from "../data/feature-rules.js";
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  Brand,
  ProductData,
} from "../types/product.js";
import { mergeFeatures, resolveFeatures } from "./catalog.service.js";
import { buildRecommendations } from "./recommendations.service.js";

const BRAND_ALIASES: Record<string, Brand> = {
  lloyds: "lloyds",
  halifax: "halifax",
  "bank of scotland": "bos",
  bos: "bos",
  mbna: "mbna",
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ");
}

const ALL_BRANDS: Brand[] = ["lloyds", "halifax", "bos", "mbna"];

function detectBrands(message: string, current: Brand[]): Brand[] {
  const text = normalize(message);
  if (
    text.includes("all brands") ||
    text.includes("all four brands") ||
    text.includes("every brand") ||
    text.includes("all lbg brands")
  ) {
    return [...ALL_BRANDS];
  }
  const brands = new Set<Brand>(current);
  for (const [alias, value] of Object.entries(BRAND_ALIASES)) {
    if (text.includes(alias)) brands.add(value);
  }
  return [...brands];
}

function scoreIntent(message: string): (typeof INTENT_PROFILES)[number] | null {
  const text = normalize(message);
  let best: (typeof INTENT_PROFILES)[number] | null = null;
  let bestScore = 0;

  for (const profile of INTENT_PROFILES) {
    let score = 0;
    for (const kw of profile.keywords) {
      if (text.includes(kw.toLowerCase())) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = profile;
    }
  }
  return bestScore > 0 ? best : null;
}

function deriveProductName(
  message: string,
  intent: (typeof INTENT_PROFILES)[number] | null,
  currentName: string,
): string {
  if (currentName.trim()) return currentName;
  if (intent?.productNameHint) {
    const brands = detectBrands(message, []);
    const brandLabel =
      brands[0] === "lloyds"
        ? "Lloyds"
        : brands[0] === "halifax"
          ? "Halifax"
          : brands[0] === "bos"
            ? "Bank of Scotland"
            : brands[0] === "mbna"
              ? "MBNA"
              : "";
    return brandLabel
      ? `${brandLabel} ${intent.productNameHint} Card`
      : `${intent.productNameHint} Card`;
  }
  const quoted = message.match(/"([^"]+)"/)?.[1];
  if (quoted) return quoted;
  return currentName;
}

export function runConfigurationAssistant(
  request: AssistantChatRequest,
): AssistantChatResponse {
  const { message, productData: input } = request;
  const text = normalize(message);
  const intent = scoreIntent(message);
  const mergedBrands: Brand[] = intent?.brands?.length
    ? [...new Set<Brand>([...input.brands, ...intent.brands])]
    : input.brands;
  const brands = detectBrands(message, mergedBrands);

  let featureIdsToAdd: string[] = [];
  if (intent) {
    featureIdsToAdd = [...intent.featureIds];
  }

  if (text.includes("no fx") || text.includes("zero fx") || text.includes("no foreign exchange")) {
    featureIdsToAdd.push("zero-fx-fees");
  }
  if (text.includes("lounge")) {
    featureIdsToAdd.push("airport-lounge", "concierge-service");
  }
  if (text.includes("cashback") && !text.includes("no cashback")) {
    featureIdsToAdd.push("cashback-rewards", "spending-insights");
  }

  const existingIds = new Set(input.features.map((f) => f.id));
  const newFeatures = resolveFeatures([...new Set(featureIdsToAdd)]).filter(
    (f) => !existingIds.has(f.id),
  );

  const updated: ProductData = {
    ...input,
    productName: deriveProductName(message, intent, input.productName),
    brands: brands.length > 0 ? brands : input.brands,
    features: mergeFeatures(input.features, newFeatures),
  };

  const recs = buildRecommendations(updated).recommendations;
  const complementary = recs.filter((r) => r.type === "complementary" || r.type === "compliance");

  const reply = buildReply(message, intent, newFeatures, complementary, updated);

  return {
    reply,
    productData: updated,
    featuresAdded: newFeatures,
    featuresRemoved: [],
    suggestions: complementary.slice(0, 5),
    engine: "rules",
  };
}

function buildReply(
  message: string,
  intent: (typeof INTENT_PROFILES)[number] | null,
  added: { name: string }[],
  suggestions: { title: string; reason: string }[],
  product: ProductData,
): string {
  const lines: string[] = [];

  if (intent) {
    lines.push(
      `I've configured this as a **${intent.description}** profile based on your request.`,
    );
  } else if (added.length === 0) {
    lines.push(
      "I understood your message but couldn't map it to a specific product template. Try describing the card type (e.g. premium travel, cashback, balance transfer).",
    );
  }

  if (product.productName) {
    lines.push(`**Product name:** ${product.productName}`);
  }
  if (product.brands.length > 0) {
    lines.push(`**Brands:** ${product.brands.join(", ")}`);
  }

  if (added.length > 0) {
    lines.push(
      `**Added ${added.length} feature(s):** ${added.map((f) => f.name).join(", ")}.`,
    );
  } else if (intent) {
    lines.push("All suggested features were already selected.");
  }

  if (suggestions.length > 0) {
    lines.push("", "**You might also want:**");
    for (const s of suggestions.slice(0, 3)) {
      lines.push(`- ${s.title}: ${s.reason}`);
    }
  }

  if (lines.length === 0) {
    return `Thanks — I received: "${message.slice(0, 120)}${message.length > 120 ? "…" : ""}". Describe the product you want to set up and I'll select features from the catalog.`;
  }

  return lines.join("\n");
}
