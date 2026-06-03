# FeatureFlow AI Backend

AI utilities API for the **FeatureFlow Product Setup** wizard ([featureflow-builder](../featureflow-builder)).

## Capabilities

1. **AI Product Configuration Assistant** — `POST /api/ai/assistant/chat`  
   Chat-style natural language configuration, e.g.  
   *"Set up a premium travel card for Lloyds with no FX fees and lounge access"*  
   Auto-selects features from the 79-item catalog and suggests complementary options.

2. **Smart Feature Recommendations** — `POST /api/ai/recommendations`  
   Analyzes the current feature selection for:
   - Missing features (similar approved products)
   - Complementary bundles (e.g. Cashback + Spending Insights)
   - Conflicts / redundancy (e.g. Paperless + Statement Default)
   - Compliance gaps (e.g. Gambling Block + Spending Controls)

## Quick start

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Server: [http://localhost:3001](http://localhost:3001)

## Frontend integration

1. Proxy in `featureflow-builder/vite.config.ts`:

```ts
proxy: {
  "/api/ai": { target: "http://localhost:3001", changeOrigin: true },
  "/api/catalog": { target: "http://localhost:3001", changeOrigin: true },
},
```

2. Call from the wizard, e.g.:

```ts
const res = await fetch("/api/ai/assistant/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message, productData, conversationHistory }),
});
const { reply, productData, featuresAdded, suggestions } = await res.json();
```

See [docs/API.md](./docs/API.md) for full contracts.

## Optional OpenAI

Set `OPENAI_API_KEY` in `.env`. The assistant uses structured JSON from the model and falls back to the built-in rule engine if the call fails.

## Catalog sync

The catalog is extracted from `featureflow-builder/src/types/product.ts`:

```bash
npm run sync-catalog
```

## Tests

```bash
npm test
```

## Project layout

```
src/
  data/           feature-catalog.json, feature-rules.ts
  services/       assistant, recommendations, catalog, llm
  routes/         /api/ai, /api/catalog
  types/          shared ProductData types
docs/API.md
```
