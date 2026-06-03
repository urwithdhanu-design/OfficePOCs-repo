import { TrendingUp, Shield, Clock, Search, Bell, Target } from "lucide-react";
import { platformOverviewContent } from "@/content/platformOverview";
import { sectionPadding, sectionMinHeight } from "@/lib/section-utils";
import { cn } from "@/lib/utils";

const icons = [TrendingUp, Shield, Clock, Search, Bell, Target];

const WhyItMattersSection = ({ embedded }: { embedded?: boolean }) => {
  const { whyItMatters } = platformOverviewContent;

  return (
    <section
      id="why-it-matters"
      className={cn("relative bg-surface-elevated/50", sectionPadding(embedded), sectionMinHeight(embedded))}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 animate-on-scroll">
          <span className="text-sm font-mono text-primary uppercase tracking-widest mb-3 block">
            {whyItMatters.heading}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{whyItMatters.title}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{whyItMatters.description}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {whyItMatters.customerBenefits.map((benefit, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div
                key={benefit.title}
                className="glass-surface rounded-xl p-6 gradient-border animate-on-scroll hover:bg-card/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyItMattersSection;
