# ContractIQ AI

**Autonomous Contract Intelligence Platform**

> Contracts should manage themselves.

ContractIQ AI transforms contracts into intelligent business assets — reading, understanding obligations, detecting risks, tracking renewals, and driving business actions autonomously.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080)

## Platform Walkthrough

1. **Landing page** (`/`) — Problem, solution, AI agents, architecture, business impact
2. **Dashboard** (`/dashboard`) — Portfolio KPIs + AI insights widget
3. **Upload** (`/upload`) — Drag & drop with animated AI processing pipeline
4. **AI Summary** (`/summary`) — Extracted metadata, risk score, health score
5. **Risk Center** (`/risk`) — Portfolio risk heatmap
6. **Contract Chat** (`/chat`) — Natural language Q&A on contracts

## Theme & View Switchers

Use the controls in the navbar (landing) or sidebar (platform):

| Switcher | Options |
|---|---|
| **Theme** | Dark (default) · Lloyds Light |
| **View** | Pages (sidebar navigation) · Carousel (single-page auto-rotating tabs) |

Preferences are saved to localStorage.

## Platform Overview PDF

Pre-sign-in tab content is available as a downloadable PDF:

- **File:** `public/ContractIQ-Platform-Overview.pdf`
- **In app:** Click **Download PDF** in the navbar or **PDF** in the tab carousel header
- **Regenerate:** `npm run generate:pdf`

## Innovation Highlights

| Feature | Description |
|---|---|
| **Contract Health Score** | Single 0–100 score combining risk, compliance, renewals, obligations |
| **AI Agent Layer** | Review, Compliance, Renewal, Negotiation agents |
| **Contract OS** | Contracts actively drive actions — not just storage |
| **5 min vs 5 days** | Autonomous renewal workflow with minimal human approval |

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router + TanStack Query
