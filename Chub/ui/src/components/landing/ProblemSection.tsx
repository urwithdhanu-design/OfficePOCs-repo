import { AlertTriangle, Clock, Code, RotateCcw } from "lucide-react";

const problems = [
  {
    icon: Code,
    title: "Code Changes Required",
    description: "Every config update demands code changes, pull requests, and merge cycles.",
  },
  {
    icon: RotateCcw,
    title: "Forced Redeployments",
    description: "Simple flag toggles trigger full redeployment pipelines across services.",
  },
  {
    icon: Clock,
    title: "Delayed Rollouts",
    description: "Feature rollouts are gated by deployment schedules, not business needs.",
  },
  {
    icon: AlertTriangle,
    title: "Operational Risk",
    description: "Manual config updates lead to inconsistencies, downtime, and incidents.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10 animate-on-scroll">
          <span className="text-sm font-mono text-destructive/80 uppercase tracking-widest mb-3 block">The Problem</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Config changes shouldn't be this hard
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Traditional configuration management is brittle, slow, and risky.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-14 animate-on-scroll">
          <div className="glass-surface rounded-xl p-8 gradient-border">
            <ProblemDiagram />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {problems.map((problem, i) => (
            <div
              key={problem.title}
              className="glass-surface rounded-lg p-6 gradient-border group hover:bg-card/80 transition-colors animate-on-scroll"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <problem.icon className="w-5 h-5 text-destructive/70 mb-3" />
              <h3 className="font-semibold text-foreground mb-2 text-sm">{problem.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProblemDiagram = () => (
  <svg viewBox="0 0 800 200" className="w-full h-auto">
    <rect x="20" y="60" width="120" height="80" rx="8" className="fill-secondary stroke-border" strokeWidth="1" />
    <text x="80" y="95" textAnchor="middle" className="fill-foreground text-xs font-mono" fontSize="12">Developer</text>
    <text x="80" y="115" textAnchor="middle" className="fill-muted-foreground" fontSize="10">changes config</text>

    <line x1="140" y1="100" x2="210" y2="100" className="stroke-destructive/60" strokeWidth="2" strokeDasharray="6 4" />
    <text x="175" y="90" textAnchor="middle" className="fill-destructive/80" fontSize="9">code change</text>

    <rect x="210" y="60" width="120" height="80" rx="8" className="fill-secondary stroke-border" strokeWidth="1" />
    <text x="270" y="95" textAnchor="middle" className="fill-foreground text-xs font-mono" fontSize="12">PR + Review</text>
    <text x="270" y="115" textAnchor="middle" className="fill-muted-foreground" fontSize="10">~hours to days</text>

    <line x1="330" y1="100" x2="400" y2="100" className="stroke-destructive/60" strokeWidth="2" strokeDasharray="6 4" />
    <text x="365" y="90" textAnchor="middle" className="fill-destructive/80" fontSize="9">merge</text>

    <rect x="400" y="60" width="120" height="80" rx="8" className="fill-secondary stroke-border" strokeWidth="1" />
    <text x="460" y="95" textAnchor="middle" className="fill-foreground text-xs font-mono" fontSize="12">CI / CD</text>
    <text x="460" y="115" textAnchor="middle" className="fill-muted-foreground" fontSize="10">build + deploy</text>

    <line x1="520" y1="100" x2="590" y2="100" className="stroke-destructive/60" strokeWidth="2" strokeDasharray="6 4" />
    <text x="555" y="90" textAnchor="middle" className="fill-destructive/80" fontSize="9">redeploy</text>

    <rect x="590" y="60" width="140" height="80" rx="8" className="fill-secondary stroke-destructive/30" strokeWidth="1.5" />
    <text x="660" y="95" textAnchor="middle" className="fill-foreground text-xs font-mono" fontSize="12">Production</text>
    <text x="660" y="115" textAnchor="middle" className="fill-destructive/60" fontSize="10">downtime risk</text>

    <line x1="80" y1="165" x2="660" y2="165" className="stroke-muted-foreground/30" strokeWidth="1" />
    <text x="370" y="185" textAnchor="middle" className="fill-muted-foreground" fontSize="11">Hours to days for a single config change</text>
  </svg>
);

export default ProblemSection;
