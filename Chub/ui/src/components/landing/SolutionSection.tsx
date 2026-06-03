import { CheckCircle2 } from "lucide-react";

const benefits = [
  "Instant propagation to all services",
  "Zero-downtime configuration updates",
  "Environment-aware config management",
  "Full audit trail & version history",
  "Role-based access controls",
  "Rollback in seconds, not hours",
];

const SolutionSection = () => {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-10 animate-on-scroll">
          <span className="text-sm font-mono text-primary uppercase tracking-widest mb-3 block">The Solution</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            C Hub: Your single source of truth
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Manage runtime configuration centrally. Push changes instantly. No code. No deploys.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-14 animate-on-scroll">
          <div className="glass-surface rounded-xl p-8 gradient-border">
            <SolutionDiagram />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {benefits.map((benefit, i) => (
            <div
              key={benefit}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/10 animate-on-scroll"
              style={{ animationDelay: `${0.08 * i}s` }}
            >
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm text-foreground">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SolutionDiagram = () => (
  <svg viewBox="0 0 800 280" className="w-full h-auto">
    <rect x="280" y="20" width="240" height="90" rx="12" className="fill-primary/10 stroke-primary/50" strokeWidth="1.5" />
    <text x="400" y="55" textAnchor="middle" className="fill-primary font-mono" fontSize="16" fontWeight="bold">C Hub</text>
    <text x="400" y="78" textAnchor="middle" className="fill-muted-foreground" fontSize="11">Central Configuration Platform</text>

    <rect x="10" y="35" width="130" height="60" rx="8" className="fill-secondary stroke-border" strokeWidth="1" />
    <text x="75" y="62" textAnchor="middle" className="fill-foreground font-mono" fontSize="11">Operator</text>
    <text x="75" y="78" textAnchor="middle" className="fill-primary" fontSize="9">updates config</text>

    <line x1="140" y1="65" x2="280" y2="65" className="stroke-primary/60" strokeWidth="2" />
    <polygon points="275,60 285,65 275,70" className="fill-primary/60" />
    <text x="210" y="55" textAnchor="middle" className="fill-primary/70" fontSize="9">instant</text>

    {[
      { x: 80, label: "Service A", env: "Production" },
      { x: 320, label: "Service B", env: "Staging" },
      { x: 560, label: "Service C", env: "Production" },
    ].map((svc) => (
      <g key={svc.label}>
        <rect x={svc.x} y={180} width={160} height={70} rx="8" className="fill-secondary stroke-primary/20" strokeWidth="1" />
        <text x={svc.x + 80} y={210} textAnchor="middle" className="fill-foreground font-mono" fontSize="11">{svc.label}</text>
        <text x={svc.x + 80} y={228} textAnchor="middle" className="fill-muted-foreground" fontSize="9">{svc.env}</text>
        <line x1="400" y1="110" x2={svc.x + 80} y2="180" className="stroke-primary/40" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx={svc.x + 80} cy={180} r="3" className="fill-primary/60" />
      </g>
    ))}

    <text x="400" y="152" textAnchor="middle" className="fill-primary/50" fontSize="10">real-time propagation</text>
  </svg>
);

export default SolutionSection;
