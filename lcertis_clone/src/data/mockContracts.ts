export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ContractRisk {
  id: string;
  title: string;
  level: RiskLevel;
  description: string;
}

export interface Contract {
  id: string;
  name: string;
  parties: string[];
  startDate: string;
  endDate: string;
  renewalTerms: string;
  terminationTerms: string;
  paymentTerms: string;
  value: number;
  status: "active" | "expiring" | "pending" | "expired";
  healthScore: number;
  riskScore: number;
  risks: ContractRisk[];
  summary: string;
}

export const mockContracts: Contract[] = [
  {
    id: "ctr-001",
    name: "Enterprise SaaS License Agreement",
    parties: ["Acme Corp", "CloudServe Technologies"],
    startDate: "2023-04-01",
    endDate: "2026-03-31",
    renewalTerms: "Auto-renewal with 90-day notice period",
    terminationTerms: "30-day written notice; early termination fee applies",
    paymentTerms: "₹42L annually, net-30, 5% late penalty",
    value: 4200000,
    status: "expiring",
    healthScore: 72,
    riskScore: 68,
    summary:
      "Three-year enterprise SaaS license covering 2,500 seats with auto-renewal. Contains unlimited liability clause and missing data privacy addendum. Renewal window opens in 45 days.",
    risks: [
      { id: "r1", title: "Unlimited Liability", level: "critical", description: "Vendor liability is uncapped in Section 8.2" },
      { id: "r2", title: "Auto Renewal Enabled", level: "high", description: "Contract auto-renews unless cancelled 90 days prior" },
      { id: "r3", title: "Missing Data Privacy Clause", level: "high", description: "No GDPR/DPDP compliance language found" },
    ],
  },
  {
    id: "ctr-002",
    name: "Office Lease Agreement — Bangalore HQ",
    parties: ["Acme Corp", "Prestige Estates Ltd"],
    startDate: "2022-01-01",
    endDate: "2027-12-31",
    renewalTerms: "Option to renew for 5 years at market rate",
    terminationTerms: "Break clause after year 3 with 6-month penalty",
    paymentTerms: "₹18L monthly rent, quarterly escalation at 5%",
    value: 21600000,
    status: "active",
    healthScore: 92,
    riskScore: 22,
    summary:
      "Five-year commercial lease for 45,000 sq ft Bangalore headquarters. Strong termination protections and clear escalation caps. Compliance clauses present.",
    risks: [
      { id: "r4", title: "Escalation Cap Missing", level: "medium", description: "Annual escalation may exceed budget forecasts" },
    ],
  },
  {
    id: "ctr-003",
    name: "Vendor NDA — Data Analytics Partner",
    parties: ["Acme Corp", "InsightEdge Analytics"],
    startDate: "2024-06-15",
    endDate: "2025-06-14",
    renewalTerms: "Manual renewal required annually",
    terminationTerms: "Either party may terminate with 30-day notice",
    paymentTerms: "No monetary consideration",
    value: 0,
    status: "expiring",
    healthScore: 58,
    riskScore: 74,
    summary:
      "Mutual NDA for data analytics collaboration. Missing confidentiality clause for sub-processors and lacks HIPAA reference for healthcare data handling.",
    risks: [
      { id: "r5", title: "Missing Confidentiality Clause", level: "critical", description: "Sub-processor confidentiality not addressed" },
      { id: "r6", title: "Missing HIPAA Reference", level: "high", description: "Healthcare data handling not covered" },
    ],
  },
  {
    id: "ctr-004",
    name: "IT Infrastructure Support SLA",
    parties: ["Acme Corp", "TechGuard Solutions"],
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    renewalTerms: "Renewal negotiation 60 days before expiry",
    terminationTerms: "For cause termination with 15-day cure period",
    paymentTerms: "₹8.5L monthly, SLA credits for downtime",
    value: 10200000,
    status: "active",
    healthScore: 85,
    riskScore: 35,
    summary:
      "24/7 IT infrastructure support with defined SLA tiers. Penalty clauses for downtime below 99.9% uptime. GDPR compliance addendum attached.",
    risks: [
      { id: "r7", title: "SLA Penalty Cap", level: "low", description: "Monthly penalty capped at 10% of fees" },
    ],
  },
  {
    id: "ctr-005",
    name: "Marketing Agency Retainer",
    parties: ["Acme Corp", "BrandPulse Media"],
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    renewalTerms: "Auto-renews unless 30-day notice given",
    terminationTerms: "Immediate termination for material breach",
    paymentTerms: "₹25L quarterly retainer",
    value: 10000000,
    status: "pending",
    healthScore: 64,
    riskScore: 55,
    summary:
      "Annual marketing retainer with performance KPIs. Pending legal review due to ambiguous IP ownership clause for creative assets.",
    risks: [
      { id: "r8", title: "IP Ownership Ambiguity", level: "medium", description: "Creative asset ownership unclear in Section 4" },
      { id: "r9", title: "Auto Renewal Enabled", level: "medium", description: "Auto-renews with only 30-day notice window" },
    ],
  },
];

export const dashboardStats = {
  activeContracts: 847,
  expiringSoon: 23,
  highRisk: 12,
  pendingApprovals: 8,
  renewalsDue: 15,
  totalValue: 142000000,
};

export const aiInsights = [
  "5 contracts expiring in 30 days — ₹3.2 Cr renewal opportunity",
  "2 contracts missing liability clauses require immediate review",
  "Renewal Agent drafted 3 renewal proposals ready for approval",
  "Compliance Agent flagged 4 contracts for GDPR gap remediation",
];

export const chatResponses: Record<string, string> = {
  "when does this contract expire":
    "The Enterprise SaaS License Agreement expires on **March 31, 2026**. The renewal notice period is 90 days — you must act by **January 1, 2026** to prevent auto-renewal.",
  "what penalties exist":
    "This contract includes:\n\n• **Late payment penalty**: 5% per month on overdue amounts\n• **Early termination fee**: 50% of remaining contract value\n• **SLA breach credits**: Up to 10% monthly fee reduction for uptime below 99.9%",
  "show all payment obligations":
    "Payment obligations identified:\n\n1. **Annual license fee**: ₹42,00,000 — due April 1 each year\n2. **Implementation fee**: ₹8,00,000 — one-time (paid)\n3. **Support tier upgrade**: ₹6,00,000 — optional add-on\n4. **Overage charges**: ₹850/seat/month beyond 2,500 seats",
  "compare with company policy":
    "Policy comparison for Enterprise SaaS License:\n\n| Policy Area | Company Standard | Contract Status |\n|---|---|---|\n| Liability cap | 2× annual fees | ❌ Unlimited |\n| Data privacy | GDPR + DPDP required | ❌ Missing |\n| Auto-renewal | Opt-in only | ⚠️ Opt-out required |\n| Payment terms | Net-45 | ⚠️ Net-30 |\n\n**Recommendation**: Negotiate liability cap and add data privacy addendum before renewal.",
};

export function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: "text-success bg-success/10 border-success/30",
    medium: "text-warning bg-warning/10 border-warning/30",
    high: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    critical: "text-destructive bg-destructive/10 border-destructive/30",
  };
  return colors[level];
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}
