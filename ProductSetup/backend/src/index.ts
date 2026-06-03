import "dotenv/config";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3001);
const app = createApp();

app.listen(port, () => {
  console.log(`FeatureFlow AI backend listening on http://localhost:${port}`);
  console.log(`  Health:        GET  /health`);
  console.log(`  Catalog:       GET  /api/catalog/features`);
  console.log(`  Assistant:     POST /api/ai/assistant/chat`);
  console.log(`  Recommendations: POST /api/ai/recommendations`);
});
