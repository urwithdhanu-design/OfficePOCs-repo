import { sectionPadding, sectionMinHeight } from "@/lib/section-utils";
import { cn } from "@/lib/utils";

const metrics = [
  { value: "70%", label: "Faster reviews" },
  { value: "60%", label: "Fewer missed renewals" },
  { value: "80%", label: "Faster contract search" },
  { value: "↓", label: "Reduced legal risk" },
];

const ImpactSection = ({ embedded }: { embedded?: boolean }) => {
  return (
    <section className={cn("relative bg-surface-elevated/50", sectionPadding(embedded), sectionMinHeight(embedded))}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-14 animate-on-scroll">
          <span className="text-sm font-mono text-success uppercase tracking-widest mb-3 block">Business Impact</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Measurable outcomes
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16 animate-on-scroll">
          {metrics.map((m) => (
            <div key={m.label} className="glass-surface rounded-xl p-6 text-center gradient-border">
              <p className="text-4xl md:text-5xl font-bold text-success mb-2">{m.value}</p>
              <p className="text-sm text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto animate-on-scroll">
          <div className="glass-surface rounded-xl p-8 gradient-border">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-mono text-destructive/80 uppercase tracking-wider mb-3">Current Process</p>
                <p className="text-5xl font-bold text-destructive/80 mb-2">5 days</p>
                <p className="text-sm text-muted-foreground">
                  Manual review, email chains, missed deadlines, and reactive compliance
                </p>
              </div>
              <div>
                <p className="text-xs font-mono text-success uppercase tracking-wider mb-3">With ContractIQ AI</p>
                <p className="text-5xl font-bold text-success mb-2">5 minutes</p>
                <p className="text-sm text-muted-foreground">
                  AI detects expiry → drafts renewal → schedules review → human approves
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
