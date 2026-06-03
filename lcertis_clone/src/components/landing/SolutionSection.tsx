import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Shield, Bell, Lightbulb, MessageSquare, FileSearch } from "lucide-react";
import { sectionPadding, sectionMinHeight } from "@/lib/section-utils";
import { cn } from "@/lib/utils";

const capabilities = [
  { icon: FileSearch, text: "Reads contracts automatically" },
  { icon: Brain, text: "Understands obligations" },
  { icon: Shield, text: "Detects risks" },
  { icon: Bell, text: "Tracks renewals & sends reminders" },
  { icon: Lightbulb, text: "Recommends actions" },
  { icon: MessageSquare, text: "Answers contract questions using AI" },
];

const SolutionSection = ({ embedded }: { embedded?: boolean }) => {
  return (
    <section id="solution" className={cn("relative bg-surface-elevated/50", sectionPadding(embedded), sectionMinHeight(embedded))}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-14 animate-on-scroll">
          <span className="text-sm font-mono text-primary uppercase tracking-widest mb-3 block">The Solution</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            From storage to operating system
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Most CLM platforms are contract storage systems. ContractIQ becomes a{" "}
            <span className="text-primary font-semibold">Contract Operating System</span> — where
            contracts actively drive business actions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div className="space-y-4 animate-on-scroll">
            {capabilities.map((cap, i) => (
              <div key={i} className="flex items-center gap-4 glass-surface rounded-lg p-4 gradient-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <cap.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-foreground font-medium">{cap.text}</p>
              </div>
            ))}
          </div>

          <div className="animate-on-scroll">
            <div className="glass-surface rounded-xl p-8 gradient-border">
              <p className="text-sm font-mono text-primary mb-4 uppercase tracking-wider">User Journey</p>
              <div className="space-y-0">
                {[
                  "Upload Contract",
                  "AI Reads Contract",
                  "Extracts Metadata",
                  "Identifies Risks",
                  "Creates Obligations",
                  "Tracks Deadlines",
                  "Generates Insights",
                  "Alerts Stakeholders",
                ].map((step, i, arr) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-xs font-mono text-primary">
                        {i + 1}
                      </div>
                      {i < arr.length - 1 && <div className="w-px h-6 bg-primary/20" />}
                    </div>
                    <p className="text-sm text-foreground pb-4">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="hero" className="w-full mt-6" asChild>
              <Link to="/login">
                See It In Action <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
