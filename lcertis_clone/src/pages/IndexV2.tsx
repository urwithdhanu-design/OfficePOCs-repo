import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const IndexV2 = () => {
  return (
    <div className="min-h-screen bg-background">
      <V2Navbar />
      <CarouselHero />
      <CTASection />
      <V2Footer />
    </div>
  );
};

/* ─── Navbar ─── */
const V2Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl animate-fade-down">
    <div className="container mx-auto px-6 flex items-center justify-between h-16">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center glow-primary">
          <span className="text-primary font-mono font-bold text-sm">C</span>
        </div>
        <span className="font-semibold text-foreground text-lg">Hub</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">V1</a>
        <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</a>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-muted-foreground">Sign In</Button>
        <Button variant="default" size="sm">Get Started</Button>
      </div>
    </div>
  </nav>
);

/* ─── Carousel Hero ─── */
const slides = [
  {
    id: "pipeline",
    problemLabel: "The Old Way",
    solutionLabel: "With C Hub",
    title: "From Pipeline Chaos to Instant Delivery",
    subtitle: "Config changes no longer require code changes, PRs, CI/CD, and redeployments.",
  },
  {
    id: "scatter",
    problemLabel: "Scattered Configs",
    solutionLabel: "Centralized Hub",
    title: "From Config Sprawl to a Single Source of Truth",
    subtitle: "No more hunting through repos, env files, and dashboards for the right value.",
  },
  {
    id: "risk",
    problemLabel: "High Risk",
    solutionLabel: "Safe & Controlled",
    title: "From Risky Deploys to Safe Rollbacks",
    subtitle: "Version every change, roll back instantly, and control who can modify what.",
  },
];

const CarouselHero = () => {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const goTo = useCallback((idx: number) => {
    setDirection(idx > active ? "right" : "left");
    setActive(idx);
  }, [active]);

  const next = useCallback(() => {
    setDirection("right");
    setActive((p) => (p + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection("left");
    setActive((p) => (p - 1 + slides.length) % slides.length);
  }, []);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[active];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-accent/6 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />

      <div className="container relative z-10 mx-auto px-6">
        {/* Text */}
        <div className="text-center mb-12 animate-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono mb-6">
            C Hub — Configuration Lifecycle Platform
          </span>
          <h1
            key={slide.id + "-title"}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 leading-[1.08] carousel-slide-text"
          >
            <span className="text-foreground">{slide.title.split(" to ")[0]} to </span>
            <span className="gradient-text">{slide.title.split(" to ")[1]}</span>
          </h1>
          <p
            key={slide.id + "-sub"}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto carousel-slide-text"
          >
            {slide.subtitle}
          </p>
        </div>

        {/* Visual Carousel */}
        <div className="max-w-5xl mx-auto relative">
          <div className="glass-surface rounded-2xl p-6 md:p-10 gradient-border overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
              {/* Problem side */}
              <div
                key={slide.id + "-problem"}
                className="carousel-slide-visual"
              >
                <div className="text-xs font-mono text-destructive/80 uppercase tracking-widest mb-3">{slide.problemLabel}</div>
                <SlideVisualProblem slideId={slide.id} />
              </div>

              {/* Arrow divider */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center glow-primary">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Solution side */}
              <div
                key={slide.id + "-solution"}
                className="carousel-slide-visual"
                style={{ animationDelay: "0.15s" }}
              >
                <div className="text-xs font-mono text-primary uppercase tracking-widest mb-3">{slide.solutionLabel}</div>
                <SlideVisualSolution slideId={slide.id} />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-border/60 bg-card/60 hover:bg-card flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === active ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-border/60 bg-card/60 hover:bg-card flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Slide Visuals ─── */

const SlideVisualProblem = ({ slideId }: { slideId: string }) => {
  if (slideId === "pipeline") return <PipelineProblem />;
  if (slideId === "scatter") return <ScatterProblem />;
  return <RiskProblem />;
};

const SlideVisualSolution = ({ slideId }: { slideId: string }) => {
  if (slideId === "pipeline") return <PipelineSolution />;
  if (slideId === "scatter") return <ScatterSolution />;
  return <RiskSolution />;
};

/* Slide 1: Pipeline */
const PipelineProblem = () => (
  <div className="space-y-3">
    {["Code Change", "PR Review", "CI Build", "Deploy", "Verify"].map((step, i) => (
      <div key={step} className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center text-xs font-mono text-destructive/70">
          {i + 1}
        </div>
        <div className="flex-1 h-10 rounded-lg bg-secondary border border-border/50 flex items-center px-3">
          <span className="text-sm text-muted-foreground">{step}</span>
        </div>
        {i < 4 && (
          <div className="text-muted-foreground/40 text-xs">→</div>
        )}
      </div>
    ))}
    <div className="text-center text-xs text-destructive/60 font-mono mt-2 pt-2 border-t border-destructive/10">
      ⏱ Hours to days per config change
    </div>
  </div>
);

const PipelineSolution = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-xs font-mono text-primary font-bold">
        1
      </div>
      <div className="flex-1 h-12 rounded-lg bg-primary/5 border border-primary/20 flex items-center px-4">
        <span className="text-sm text-foreground font-medium">Update in C Hub</span>
      </div>
    </div>
    <div className="flex justify-center">
      <div className="w-px h-6 bg-primary/40" />
    </div>
    <div className="grid grid-cols-3 gap-2">
      {["Service A", "Service B", "Service C"].map((s) => (
        <div key={s} className="h-14 rounded-lg bg-primary/5 border border-primary/15 flex flex-col items-center justify-center">
          <span className="text-xs text-foreground font-mono">{s}</span>
          <span className="text-[10px] text-primary">✓ synced</span>
        </div>
      ))}
    </div>
    <div className="text-center text-xs text-primary/80 font-mono mt-2 pt-2 border-t border-primary/15">
      ⚡ Instant propagation — zero deploys
    </div>
  </div>
);

/* Slide 2: Scatter */
const ScatterProblem = () => (
  <div className="relative min-h-[220px]">
    {[
      { label: ".env.prod", x: "10%", y: "5%", rot: -3 },
      { label: "k8s-configmap", x: "55%", y: "10%", rot: 2 },
      { label: "secrets.yaml", x: "25%", y: "40%", rot: -5 },
      { label: "dashboard UI", x: "60%", y: "50%", rot: 4 },
      { label: "README.md", x: "5%", y: "70%", rot: -2 },
      { label: "wiki page", x: "50%", y: "75%", rot: 3 },
    ].map((item) => (
      <div
        key={item.label}
        className="absolute px-3 py-2 rounded-lg bg-destructive/5 border border-destructive/15 text-xs font-mono text-muted-foreground"
        style={{ left: item.x, top: item.y, transform: `rotate(${item.rot}deg)` }}
      >
        {item.label}
      </div>
    ))}
    <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-destructive/60 font-mono pt-2 border-t border-destructive/10">
      🔍 "Where is that config value?"
    </div>
  </div>
);

const ScatterSolution = () => (
  <div className="flex flex-col items-center gap-4">
    <div className="w-full rounded-xl bg-primary/5 border border-primary/20 p-4">
      <div className="text-xs font-mono text-primary mb-3 text-center font-bold">C Hub — All Configs</div>
      <div className="space-y-2">
        {[
          { key: "feature.darkMode", val: "true", env: "prod" },
          { key: "api.rateLimit", val: "1000", env: "all" },
          { key: "cache.ttl", val: "3600", env: "staging" },
          { key: "auth.provider", val: "oauth2", env: "prod" },
        ].map((item) => (
          <div key={item.key} className="flex items-center gap-2 px-3 py-1.5 rounded bg-secondary/80 border border-border/30">
            <span className="text-xs text-foreground font-mono flex-1 truncate">{item.key}</span>
            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">{item.env}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="text-center text-xs text-primary/80 font-mono">
      ✅ One place. Every config. Every env.
    </div>
  </div>
);

/* Slide 3: Risk */
const RiskProblem = () => (
  <div className="space-y-3">
    <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
      <div className="text-xs font-mono text-destructive/70 mb-2">deploy #847 — config update</div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-full h-2 bg-destructive/20 rounded-full overflow-hidden">
          <div className="w-3/4 h-full bg-destructive/50 rounded-full" />
        </div>
        <span className="text-xs text-destructive/60">75%</span>
      </div>
      <div className="text-xs text-destructive/80 font-mono">⚠ 3 services affected — rollback?</div>
    </div>
    <div className="rounded-lg bg-secondary border border-border/50 p-3 flex items-center gap-3">
      <div className="w-3 h-3 rounded-full bg-destructive/60 animate-pulse" />
      <span className="text-xs text-muted-foreground">No audit trail — who changed it?</span>
    </div>
    <div className="rounded-lg bg-secondary border border-border/50 p-3 flex items-center gap-3">
      <div className="w-3 h-3 rounded-full bg-warning/60" />
      <span className="text-xs text-muted-foreground">Manual rollback — ETA 2+ hours</span>
    </div>
  </div>
);

const RiskSolution = () => (
  <div className="space-y-3">
    <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
      <div className="text-xs font-mono text-primary mb-3 font-bold">Version History</div>
      {[
        { ver: "v12", who: "Alice", time: "2m ago", active: true },
        { ver: "v11", who: "Bob", time: "1h ago", active: false },
        { ver: "v10", who: "Alice", time: "3h ago", active: false },
      ].map((v) => (
        <div key={v.ver} className={`flex items-center gap-3 px-3 py-2 rounded mb-1 ${v.active ? "bg-primary/10 border border-primary/25" : "bg-secondary/50"}`}>
          <span className="text-xs font-mono text-foreground w-8">{v.ver}</span>
          <span className="text-xs text-muted-foreground flex-1">{v.who}</span>
          <span className="text-[10px] text-muted-foreground">{v.time}</span>
          {!v.active && (
            <button className="text-[10px] text-primary hover:text-primary/80 font-mono">rollback</button>
          )}
        </div>
      ))}
    </div>
    <div className="text-center text-xs text-primary/80 font-mono">
      🔒 Full audit trail + instant rollback
    </div>
  </div>
);

/* ─── CTA ─── */
const CTASection = () => (
  <section className="py-24 md:py-32 relative">
    <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.04] to-transparent" />
    <div className="container mx-auto px-6 relative z-10 text-center animate-on-scroll">
      <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
        Ready to simplify your configs?
      </h2>
      <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-10">
        Join teams who manage their runtime configuration from a single, powerful hub.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="hero" size="lg" className="px-8 py-6">
          Start for Free <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
        <Button variant="hero-outline" size="lg" className="px-8 py-6">
          Request a Demo
        </Button>
      </div>
    </div>
  </section>
);

/* ─── Footer ─── */
const V2Footer = () => (
  <footer className="border-t border-border/50 py-12">
    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-primary/15 flex items-center justify-center">
          <span className="text-primary font-mono font-bold text-xs">C</span>
        </div>
        <span className="text-sm text-muted-foreground">C Hub — V2 Landing</span>
      </div>
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground transition-colors">V1 Landing</a>
        <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
      </div>
    </div>
  </footer>
);

export default IndexV2;
