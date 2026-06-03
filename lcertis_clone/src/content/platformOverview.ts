export const platformOverviewContent = {
  title: "ContractIQ AI",
  tagline: "Contracts should manage themselves.",
  subtitle: "Autonomous Contract Intelligence Platform",

  overview: {
    heading: "Overview",
    summary:
      "ContractIQ AI transforms contracts into intelligent business assets — reading, understanding obligations, detecting risks, tracking renewals, and driving business actions automatically.",
    highlights: [
      "Autonomous contract analysis with health scores",
      "AI agents for review, compliance, renewal, and negotiation",
      "Natural language contract Q&A",
      "Portfolio-wide risk visibility and renewal tracking",
    ],
  },

  problem: {
    heading: "The Problem",
    title: "Thousands of contracts. Zero visibility.",
    description:
      "Large enterprises manage thousands of contracts — yet most live scattered across emails, drives, and folders, untracked and silently creating risk.",
    challenges: [
      "Contracts stored across emails, drives, and folders",
      "Renewal dates are missed",
      "Legal review takes days or weeks",
      "Compliance risks detected too late",
      "Teams spend hours searching documents",
      "Contract obligations manually tracked",
    ],
    outcomes: ["Revenue leakage", "Legal exposure", "Compliance failures", "Operational inefficiency"],
  },

  solution: {
    heading: "The Solution",
    title: "From storage to operating system",
    description:
      "Most CLM platforms are contract storage systems. ContractIQ becomes a Contract Operating System — where contracts actively drive business actions.",
    capabilities: [
      "Reads contracts automatically",
      "Understands obligations",
      "Detects risks",
      "Tracks renewals & sends reminders",
      "Recommends actions",
      "Answers contract questions using AI",
    ],
    userJourney: [
      "Upload Contract",
      "AI Reads Contract",
      "Extracts Metadata",
      "Identifies Risks",
      "Creates Obligations",
      "Tracks Deadlines",
      "Generates Insights",
      "Alerts Stakeholders",
    ],
  },

  agents: {
    heading: "AI Agents",
    title: "Four agents. One intelligent platform.",
    description:
      "Specialized AI agents work together to review, comply, renew, and negotiate — autonomously.",
    items: [
      {
        name: "Review Agent",
        checks: ["Missing clauses", "High-risk clauses", "Unusual language"],
        output: "Recommendations",
      },
      {
        name: "Compliance Agent",
        checks: ["GDPR", "HIPAA", "Internal Policies"],
        output: "Compliance report",
      },
      {
        name: "Renewal Agent",
        checks: ["Renewal dates", "Notice periods"],
        output: "Reminders, tasks & renewal drafts",
      },
      {
        name: "Negotiation Agent",
        checks: ["Alternative clauses", "Risk reductions", "Pricing"],
        output: "Negotiation recommendations",
      },
    ],
  },

  whyItMatters: {
    heading: "Why It Matters",
    title: "Built for business outcomes, not IT architecture",
    description:
      "Customers don't buy contract software — they buy fewer missed renewals, faster legal cycles, and lower compliance risk. ContractIQ AI connects every feature to a measurable business result.",
    customerBenefits: [
      {
        title: "Protect revenue",
        detail: "Never miss a renewal window or leave money on the table. AI tracks expiry dates and drafts renewals before deadlines pass.",
      },
      {
        title: "Reduce legal risk",
        detail: "Critical clauses and unlimited liability terms are flagged instantly — not discovered during a dispute.",
      },
      {
        title: "Stay compliant",
        detail: "GDPR, HIPAA, and internal policy gaps are detected at upload, not during an audit.",
      },
      {
        title: "Save legal team time",
        detail: "First-pass review, obligation extraction, and contract search cut review cycles from days to minutes.",
      },
      {
        title: "One source of truth",
        detail: "Stop hunting through email and shared drives. Every contract, obligation, and deadline lives in one intelligent hub.",
      },
      {
        title: "Act before problems escalate",
        detail: "Proactive alerts and Contract Health Scores turn reactive firefighting into planned business actions.",
      },
    ],
  },

  impact: {
    heading: "Business Impact",
    title: "Measurable outcomes",
    metrics: [
      { value: "70%", label: "Faster reviews" },
      { value: "60%", label: "Fewer missed renewals" },
      { value: "80%", label: "Faster contract search" },
      { value: "Reduced", label: "Legal & compliance risk" },
    ],
    comparison: {
      before: { label: "Current Process", time: "5 days", detail: "Manual review, email chains, missed deadlines" },
      after: { label: "With ContractIQ AI", time: "5 minutes", detail: "AI detects expiry, drafts renewal, human approves" },
    },
  },

  vision: {
    heading: "Vision",
    title: "Autonomous Contract Operations",
    description:
      "From Contract Management to Autonomous Contract Operations — where contracts expire, AI detects it, drafts the renewal, schedules stakeholder review, and negotiates approved clauses with just 5 minutes of human approval.",
  },
};

export type PlatformOverviewContent = typeof platformOverviewContent;
