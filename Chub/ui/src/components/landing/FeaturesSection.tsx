import { GitBranch, History, Layers, Lock, Radio, Shield } from "lucide-react";

const features = [
  {
    icon: Radio,
    title: "Real-Time Sync",
    description: "Config changes propagate to all connected services within milliseconds via push-based delivery.",
  },
  {
    icon: Layers,
    title: "Environment Hierarchy",
    description: "Define configs per environment with inheritance. Override only what differs between dev, staging, and prod.",
  },
  {
    icon: History,
    title: "Version History",
    description: "Every change is versioned with full audit trail. Compare diffs and understand who changed what, when.",
  },
  {
    icon: GitBranch,
    title: "Branching & Rollback",
    description: "Branch configs for experiments. Rollback any change to a previous version instantly.",
  },
  {
    icon: Shield,
    title: "Access Control",
    description: "Fine-grained RBAC with approval workflows. Ensure the right people manage the right configs.",
  },
  {
    icon: Lock,
    title: "Secrets Management",
    description: "Encrypted secrets storage with runtime injection. Never commit sensitive values to code again.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-on-scroll">
          <span className="text-sm font-mono text-primary uppercase tracking-widest mb-3 block">Features</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Everything you need to manage configs
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-surface rounded-xl p-6 gradient-border group hover:bg-card/80 transition-all animate-on-scroll"
              style={{ animationDelay: `${0.08 * i}s` }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
