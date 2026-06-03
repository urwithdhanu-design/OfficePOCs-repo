import { Search, ShieldCheck, RefreshCw, Handshake } from "lucide-react";
import { sectionPadding, sectionMinHeight } from "@/lib/section-utils";
import { cn } from "@/lib/utils";

const agents = [
  {
    icon: Search,
    name: "Review Agent",
    checks: ["Missing clauses", "High-risk clauses", "Unusual language"],
    output: "Recommendations",
  },
  {
    icon: ShieldCheck,
    name: "Compliance Agent",
    checks: ["GDPR", "HIPAA", "Internal Policies"],
    output: "Compliance report",
  },
  {
    icon: RefreshCw,
    name: "Renewal Agent",
    checks: ["Renewal dates", "Notice periods"],
    output: "Reminders, tasks & renewal drafts",
  },
  {
    icon: Handshake,
    name: "Negotiation Agent",
    checks: ["Alternative clauses", "Risk reductions", "Pricing"],
    output: "Negotiation recommendations",
  },
];

const FeaturesSection = ({ embedded }: { embedded?: boolean }) => {
  return (
    <section id="features" className={cn("relative", sectionPadding(embedded), sectionMinHeight(embedded))}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-14 animate-on-scroll">
          <span className="text-sm font-mono text-primary uppercase tracking-widest mb-3 block">AI Agents</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Four agents. One intelligent platform.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Specialized AI agents work together to review, comply, renew, and negotiate — autonomously.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {agents.map((agent, i) => (
            <div
              key={agent.name}
              className="glass-surface rounded-xl p-6 gradient-border animate-on-scroll hover:bg-card/80 transition-colors"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <agent.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{agent.name}</h3>
              </div>
              <div className="mb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Checks</p>
                <div className="flex flex-wrap gap-2">
                  {agent.checks.map((check) => (
                    <span key={check} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                      {check}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Output</p>
                <p className="text-sm text-primary font-medium">{agent.output}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
