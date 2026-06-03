# Credit Card Personalization Agent

AI financial education and personalization agent for credit card customers. Acts as a smart financial coach that understands customer behaviour and delivers personalized education—not generic tips.

## Architecture: Multi-Agent (LangGraph) + Gemini + pgvector

```
                    ┌─────────────┐
                    │   prepare   │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │ supervisor  │  ← routes by behaviour + user message
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌──────────┐   ┌──────────────┐  ┌─────────┐
    │ rewards  │   │ credit_health│  │   emi   │  ... spending, fees
    └────┬─────┘   └──────┬───────┘  └────┬────┘
           └───────────────┼───────────────┘
                           ▼
                    ┌─────────────┐
                    │ synthesizer │  ← cohesive coach response
                    └─────────────┘
```

**Why multi-agent?** Each domain (rewards, credit health, EMI, fees) has focused prompts → more accurate, actionable advice. A supervisor invokes only relevant agents → lower cost and latency than one monolithic prompt.

| Component | Technology |
|-----------|------------|
| LLM | Google Gemini (`gemini-2.0-flash`) |
| Orchestration | LangGraph (supervisor pattern) |
| Vector DB | PostgreSQL + pgvector |
| API | FastAPI |
| Mock banking | REST endpoints under `/api/v1/banking` |

## Demo customers (6 months mock data)

| Code | Persona | Behaviour |
|------|---------|-----------|
| `CUST001` | Heavy diner | High dining spend, high utilization, minimum payments, late fees |
| `CUST002` | Smart spender | Balanced categories, full payments, good reward redemption |
| `CUST003` | Large purchases | Frequent ₹10k+ spends, multiple active EMIs |

## Quick start

### Prerequisites

- Python 3.11+
- Docker Desktop
- [Google AI API key](https://aistudio.google.com/apikey)

### Setup (Windows)

```powershell
cd "C:\projects\Office POCS\Personalization Agent"
.\scripts\setup.ps1
```

Or manually:

```powershell
docker compose up -d
copy .env.example .env
# Edit .env and set GOOGLE_API_KEY

python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\python -m app.data.seed_mock_data
.\venv\Scripts\python run.py
```

Open **http://localhost:8000/docs**

## API reference

### Agent APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/agent/chat` | Chat with financial coach |
| `POST` | `/api/v1/agent/insights` | Full personalized education report |
| `GET` | `/api/v1/agent/customers/{code}/quick-tips` | Rule-based tips (no LLM) |

**Chat example:**

```json
POST /api/v1/agent/chat
{
  "customer_code": "CUST001",
  "message": "How can I improve my rewards on dining?"
}
```

**Full analysis:**

```json
POST /api/v1/agent/insights
{
  "customer_code": "CUST001",
  "focus_areas": ["rewards", "credit_health", "fees"]
}
```

### Mock banking APIs

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/banking/customers` | List customers |
| `GET /api/v1/banking/customers/{code}/transactions` | Transactions (filter by date, category) |
| `GET /api/v1/banking/customers/{code}/payments` | Payment history |
| `GET /api/v1/banking/customers/{code}/emis` | Active EMIs |
| `GET /api/v1/banking/customers/{code}/rewards` | Reward points summary |
| `GET /api/v1/banking/customers/{code}/spending/summary` | Category spend breakdown |
| `GET /api/v1/banking/customers/{code}/behavior` | Full 6-month behavior profile |
| `GET /api/v1/banking/customers/{code}/card/utilization` | Credit utilization |

## Example agent outputs

**CUST001 (heavy diner)** — Rewards agent:
> You spend ~₹15,000/month on dining. Using dining partner offers can earn 3x reward points and save ~₹4,500/year.

**CUST001** — Credit health agent:
> Your card utilization is higher than recommended (>70%). Keeping usage below 30% may help improve your credit score.

**CUST003** — EMI agent:
> Converting purchases above ₹10,000 into low-interest EMIs may reduce monthly financial pressure.

## Project structure

```
app/
├── main.py              # FastAPI app
├── agents/
│   ├── graph.py         # LangGraph workflow
│   ├── state.py
│   └── nodes/           # supervisor, specialists, synthesizer
├── api/
│   ├── agent_routes.py  # Agent endpoints
│   └── mock_banking.py  # Mock banking APIs
├── data/
│   └── seed_mock_data.py
├── models/              # SQLAlchemy + pgvector
├── services/
│   ├── behavior_analysis.py
│   ├── llm.py           # Gemini
│   └── vector_store.py  # RAG
└── schemas/
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_API_KEY` | Gemini API key |
| `GEMINI_MODEL` | Default: `gemini-2.0-flash` |
| `DATABASE_URL` | PostgreSQL async URL |

## Re-seed data

```powershell
docker compose down -v
docker compose up -d
.\venv\Scripts\python -m app.data.seed_mock_data
```
