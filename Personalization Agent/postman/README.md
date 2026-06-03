# Postman Testing Guide

## Import into Postman

1. Open **Postman**
2. **Import** → select both files:
   - `Personalization-Agent.postman_collection.json`
   - `Personalization-Agent.postman_environment.json`
3. Top-right dropdown → select **Personalization Agent - Local**

## Before testing

```powershell
cd "C:\projects\Office POCS\Personalization Agent"
docker compose up -d
.\venv\Scripts\python -m app.data.seed_mock_data
.\venv\Scripts\python run.py
```

Set `GOOGLE_API_KEY` in `.env` for Agent Chat / Insights (LLM calls).

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `baseUrl` | `http://localhost:8000` | API base URL |
| `customerCode` | `CUST001` | Active demo customer |

Change `customerCode` to `CUST002` or `CUST003` to test other personas.

## Quick test order

| Step | Request | Needs Gemini? |
|------|---------|---------------|
| 1 | Health Check | No |
| 2 | List All Customers | No |
| 3 | Behavior Profile | No |
| 4 | Quick Tips | No |
| 5 | Agent Chat - analyze | Yes |

## Manual cURL (if you prefer)

```bash
# Health
curl http://localhost:8000/health

# Behavior
curl http://localhost:8000/api/v1/banking/customers/CUST001/behavior

# Quick tips (no LLM)
curl http://localhost:8000/api/v1/agent/customers/CUST001/quick-tips

# Agent chat
curl -X POST http://localhost:8000/api/v1/agent/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"customer_code\":\"CUST001\",\"message\":\"analyze\"}"
```

## Expected personas

| Code | Try these requests |
|------|-------------------|
| CUST001 | Dining rewards chat, credit utilization, quick-tips |
| CUST002 | Insights full report (low fees, good payments) |
| CUST003 | EMI chat, GET emis, behavior profile |

## Swagger alternative

FastAPI interactive docs: http://localhost:8000/docs
