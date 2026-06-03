# FeatureFlow AI Backend API

Base URL (local): `http://localhost:3001`

Designed for **featureflow-builder** (`http://localhost:8080`). Add a Vite proxy:

```ts
// featureflow-builder/vite.config.ts
server: {
  proxy: {
    "/api/ai": { target: "http://localhost:3001", changeOrigin: true },
    "/api/catalog": { target: "http://localhost:3001", changeOrigin: true },
  },
},
```

---

## Health

### `GET /health`

```json
{ "status": "ok", "service": "featureflow-ai-backend" }
```

---

## Catalog

### `GET /api/catalog/features`

Returns the full feature catalog (synced from frontend `AVAILABLE_FEATURES`).

### `GET /api/catalog/features/:id`

Returns a single feature or `404`.

---

## 1. AI Product Configuration Assistant

Natural-language helper for the product setup wizard.

### `POST /api/ai/assistant/chat`

**Request**

```json
{
  "message": "Set up a premium travel card for Lloyds with no FX fees and lounge access",
  "productData": {
    "productName": "",
    "brands": [],
    "additionalCardholders": 0,
    "features": [],
    "externalSystems": []
  },
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response**

```json
{
  "reply": "I've configured this as a **Premium travel card...",
  "productData": { "...": "updated wizard state" },
  "featuresAdded": [{ "id": "zero-fx-fees", "code": "ZERO_FX", "...": "..." }],
  "featuresRemoved": [],
  "suggestions": [
    {
      "type": "complementary",
      "featureIds": ["multi-currency"],
      "title": "Consider adding Multi-Currency Support",
      "reason": "Zero FX fee products typically offer...",
      "severity": "info",
      "action": "add"
    }
  ],
  "engine": "rules"
}
```

**Behaviour**

- Matches intents (premium travel, cashback, digital-first, balance transfer, etc.)
- Auto-selects catalog features by keyword
- Returns complementary/compliance suggestions in `suggestions`
- Set `OPENAI_API_KEY` for LLM-backed responses (`engine: "openai"`); falls back to rules on error

### `GET /api/ai/assistant/status`

Engine probe and catalog size.

---

## 2. Smart Feature Recommendations

For the **Features** step — analyze current selection.

### `POST /api/ai/recommendations`

**Request**

```json
{
  "productData": {
    "productName": "Test Card",
    "brands": ["lloyds"],
    "additionalCardholders": 0,
    "features": [{ "id": "cashback-rewards", "...": "..." }],
    "externalSystems": []
  },
  "approvedProducts": []
}
```

Optional `approvedProducts` enables similarity-based **missing** feature suggestions; otherwise sample approved products are used.

**Response**

```json
{
  "recommendations": [
    {
      "type": "complementary",
      "featureIds": ["spending-insights"],
      "title": "Consider adding AI-Powered Spending Insights",
      "reason": "Most premium and rewards cards pair Cashback with...",
      "severity": "info",
      "action": "add"
    },
    {
      "type": "conflict",
      "featureIds": ["paperless-statements", "statement-default"],
      "title": "Conflicting or redundant features",
      "reason": "Paperless Statements and Default Statement Setting can conflict...",
      "severity": "warning",
      "action": "review"
    },
    {
      "type": "compliance",
      "featureIds": ["spending-controls"],
      "title": "Compliance gap: Advanced Spending Controls",
      "reason": "Cards with Gambling Block usually also have...",
      "severity": "warning",
      "action": "add"
    },
    {
      "type": "missing",
      "featureIds": ["travel-insurance", "concierge-service"],
      "title": "Features common on similar products (e.g. Lloyds Platinum Travel)",
      "reason": "Based on approved products like...",
      "severity": "info",
      "action": "add"
    }
  ],
  "summary": "Found 3 recommendation(s): ...",
  "engine": "rules"
}
```

**Recommendation types**

| Type | Description |
|------|-------------|
| `complementary` | Pairs commonly bundled together |
| `conflict` | Redundant or mutually exclusive features |
| `compliance` | Regulatory / best-practice gaps |
| `missing` | Features frequent on similar approved products |
| `redundant` | Reserved for future use |

---

## Types

Aligned with `featureflow-builder/src/types/product.ts`:

- `ProductData`, `ProductFeature`, `Brand`
- `FeatureRecommendation`, `AssistantChatResponse`, `RecommendationsResponse`

---

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `CORS_ORIGIN` | `http://localhost:8080` | Allowed frontend origin(s), comma-separated |
| `AI_MODE` | `rules` | Set to anything other than `rules` + `OPENAI_API_KEY` to enable OpenAI |
| `OPENAI_API_KEY` | — | Optional |
| `OPENAI_MODEL` | `gpt-4o-mini` | Optional |

---

## Sync catalog

When the frontend catalog changes:

```bash
npm run sync-catalog
```
