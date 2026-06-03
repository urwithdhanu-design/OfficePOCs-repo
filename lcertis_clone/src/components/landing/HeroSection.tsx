import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { sectionMinHeight, sectionPadding } from "@/lib/section-utils";
import { cn } from "@/lib/utils";

const HeroSection = ({ embedded }: { embedded?: boolean }) => {
  return (
    <section className={cn("relative flex items-center justify-center overflow-hidden", sectionMinHeight(embedded), sectionPadding(embedded), !embedded && "min-h-screen pt-24")}>
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="container relative z-10 mx-auto px-6 text-center">
        <div className="mb-6 animate-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            Autonomous Contract Intelligence Platform
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-[1.05] animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <span className="text-foreground">Contract</span>
          <span className="gradient-text">IQ</span>
          <span className="text-foreground"> AI</span>
        </h1>

        <p className="text-xl md:text-2xl text-primary font-medium mb-4 animate-fade-up" style={{ animationDelay: "0.25s" }}>
          Contracts should manage themselves.
        </p>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: "0.3s" }}>
          ContractIQ AI transforms contracts into intelligent business assets — reading,
          understanding, and acting on obligations automatically.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.45s" }}>
          <Button variant="hero" size="lg" className="px-8 py-6" asChild>
            <Link to="/login">
              Open Platform <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button variant="hero-outline" size="lg" className="px-8 py-6" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>

        <div className="mt-16 max-w-lg mx-auto animate-fade-up" style={{ animationDelay: "0.7s" }}>
          <div className="glass-surface rounded-lg overflow-hidden gradient-border">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
              <span className="text-xs text-muted-foreground font-mono ml-2">contract.health_score</span>
            </div>
            <div className="p-5 text-left font-mono text-sm leading-relaxed space-y-1">
              <div><span className="text-muted-foreground">// Autonomous contract analysis</span></div>
              <div>
                <span className="text-primary">contract</span>
                <span className="text-foreground">.analyze(</span>
                <span className="text-success">"SaaS_License.pdf"</span>
                <span className="text-foreground">)</span>
              </div>
              <div><span className="text-warning">→ health_score: </span><span className="text-success font-bold">92/100</span></div>
              <div><span className="text-warning">→ risks_found: </span><span className="text-destructive">3 critical</span></div>
              <div><span className="text-warning">→ renewal_draft: </span><span className="text-success">ready ✓</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
