import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="container relative z-10 mx-auto px-6 text-center">
        <div className="mb-6 animate-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono">
            <Zap className="w-3.5 h-3.5" />
            Runtime Configuration Management
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-[1.05] animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <span className="text-foreground">One Hub.</span>
          <br />
          <span className="gradient-text">Every Config.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: "0.3s" }}>
          C Hub is the single source of truth for runtime configuration across all your
          applications and environments. No code changes. No redeployments. No downtime.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.45s" }}>
          <Button variant="hero" size="lg" className="px-8 py-6">
            Get Started <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="hero-outline" size="lg" className="px-8 py-6">
            View Documentation
          </Button>
        </div>

        <div className="mt-16 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.7s" }}>
          <div className="glass-surface rounded-lg overflow-hidden gradient-border">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
              <span className="text-xs text-muted-foreground font-mono ml-2">config.update</span>
            </div>
            <div className="p-5 text-left font-mono text-sm leading-relaxed">
              <div className="animate-fade-in" style={{ animationDelay: "1.2s" }}>
                <span className="text-muted-foreground">// Update config in real-time</span>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "1.5s" }}>
                <span className="text-primary">chub</span>
                <span className="text-foreground">.set(</span>
                <span className="text-success">"feature.darkMode"</span>
                <span className="text-foreground">, </span>
                <span className="text-warning">true</span>
                <span className="text-foreground">)</span>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "1.8s" }}>
                <span className="text-muted-foreground">// ✓ Propagated to 42 instances</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
