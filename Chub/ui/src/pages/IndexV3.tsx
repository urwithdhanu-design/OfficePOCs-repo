import { useState, useEffect, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Shield, GitBranch, Radio } from "lucide-react";

/* ─── Light theme wrapper ─── */
const lightVars: Record<string, string> = {
  "--background": "60 20% 98%",
  "--foreground": "160 30% 10%",
  "--card": "0 0% 100%",
  "--card-foreground": "160 30% 10%",
  "--primary": "164 100% 24%",
  "--primary-foreground": "0 0% 100%",
  "--secondary": "160 12% 93%",
  "--secondary-foreground": "160 20% 30%",
  "--muted": "160 10% 92%",
  "--muted-foreground": "160 8% 45%",
  "--accent": "164 70% 32%",
  "--accent-foreground": "0 0% 100%",
  "--destructive": "0 72% 50%",
  "--border": "160 12% 88%",
  "--input": "160 12% 88%",
  "--ring": "164 100% 24%",
  "--success": "152 70% 38%",
  "--warning": "38 92% 50%",
};

const IndexV3 = () => {
  return (
    <div
      className="min-h-screen"
      style={lightVars as React.CSSProperties}
    >
      <div className="bg-[hsl(60,20%,98%)] text-[hsl(160,30%,10%)] min-h-screen">
        <V3Navbar />
        <V3CarouselHero />
        <V3Features />
        <V3CTA />
        <V3Footer />
      </div>
    </div>
  );
};

/* ─── Navbar ─── */
const V3Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(160,12%,88%)]/60 bg-[hsl(60,20%,98%)]/90 backdrop-blur-xl animate-fade-down">
    <div className="container mx-auto px-6 flex items-center justify-between h-16">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[hsl(164,100%,24%)] flex items-center justify-center shadow-lg shadow-[hsl(164,100%,24%)]/20">
          <span className="text-white font-mono font-bold text-sm">C</span>
        </div>
        <span className="font-bold text-[hsl(160,30%,10%)] text-xl tracking-tight">Hub</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="/" className="text-sm text-[hsl(160,8%,45%)] hover:text-[hsl(160,30%,10%)] transition-colors">V1</a>
        <a href="/v2" className="text-sm text-[hsl(160,8%,45%)] hover:text-[hsl(160,30%,10%)] transition-colors">V2</a>
        <a href="#" className="text-sm text-[hsl(160,8%,45%)] hover:text-[hsl(160,30%,10%)] transition-colors">Docs</a>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-sm text-[hsl(160,8%,45%)] hover:text-[hsl(160,30%,10%)] transition-colors px-3 py-2">Sign In</button>
        <button className="text-sm font-semibold bg-[hsl(164,100%,24%)] text-white px-5 py-2 rounded-lg hover:bg-[hsl(164,100%,28%)] transition-colors shadow-md shadow-[hsl(164,100%,24%)]/25">
          Get Started
        </button>
      </div>
    </div>
  </nav>
);

/* ─── Slides ─── */
const slides = [
  {
    id: "pipeline",
    problemLabel: "The Old Way",
    solutionLabel: "With C Hub",
    title: "Pipeline Chaos → Instant Delivery",
    subtitle: "Config changes no longer require code changes, PRs, CI/CD, and redeployments. One click. Everywhere.",
  },
  {
    id: "scatter",
    problemLabel: "Scattered Configs",
    solutionLabel: "Centralized Hub",
    title: "Config Sprawl → Single Source of Truth",
    subtitle: "Stop hunting through repos, env files, and dashboards. All configs in one searchable, environment-aware platform.",
  },
  {
    id: "risk",
    problemLabel: "High Risk",
    solutionLabel: "Safe & Controlled",
    title: "Risky Deploys → Safe Rollbacks",
    subtitle: "Every change versioned. Roll back instantly. Fine-grained access control. Full audit trail.",
  },
];

const V3CarouselHero = () => {
  const [active, setActive] = useState(0);

  const next = useCallback(() => setActive((p) => (p + 1) % slides.length), []);
  const prev = useCallback(() => setActive((p) => (p - 1 + slides.length) % slides.length), []);
  const goTo = useCallback((i: number) => setActive(i), []);

  useEffect(() => {
    const t = setInterval(next, 7000);
    return () => clearInterval(t);
  }, [next]);

  const slide = slides[active];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden">
      {/* Bright radial gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(164,40%,95%)] via-[hsl(60,20%,98%)] to-[hsl(174,30%,94%)]" />
      <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-[hsl(164,100%,24%)]/[0.06] rounded-full blur-[150px]" />
      <div className="absolute bottom-20 left-1/4 w-[500px] h-[500px] bg-[hsl(174,60%,28%)]/[0.05] rounded-full blur-[130px]" />

      <div className="container relative z-10 mx-auto px-6">
        {/* Badge */}
        <div className="text-center mb-8 animate-fade-up">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[hsl(164,100%,24%)]/20 bg-[hsl(164,100%,24%)]/[0.06] text-[hsl(164,100%,24%)] text-sm font-semibold tracking-wide">
            <Zap className="w-4 h-4" />
            Configuration Lifecycle Platform
          </span>
        </div>

        {/* Title — bigger */}
        <div className="text-center mb-14">
          <h1
            key={slide.id}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight mb-5 leading-[1.06] v3-slide-animate"
          >
            <span className="text-[hsl(160,30%,10%)]">{slide.title.split("→")[0]}</span>
            <span className="text-[hsl(164,100%,24%)]">→ {slide.title.split("→")[1]}</span>
          </h1>
          <p
            key={slide.id + "-s"}
            className="text-xl md:text-2xl text-[hsl(160,8%,45%)] max-w-3xl mx-auto leading-relaxed v3-slide-animate"
            style={{ animationDelay: "0.1s" }}
          >
            {slide.subtitle}
          </p>
        </div>

        {/* Visual card */}
        <div className="max-w-5xl mx-auto relative">
          <div
            key={slide.id + "-card"}
            className="bg-white rounded-2xl shadow-xl shadow-[hsl(160,30%,10%)]/[0.06] border border-[hsl(160,12%,88%)] p-8 md:p-12 v3-slide-animate"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-start relative">
              {/* Problem */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(0,72%,50%)]/[0.08] text-[hsl(0,72%,50%)] text-xs font-bold uppercase tracking-wider mb-5">
                  <span className="w-2 h-2 rounded-full bg-[hsl(0,72%,50%)]" />
                  {slide.problemLabel}
                </div>
                <V3ProblemVisual slideId={slide.id} />
              </div>

              {/* Center arrow */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-14 h-14 rounded-full bg-[hsl(164,100%,24%)] flex items-center justify-center shadow-lg shadow-[hsl(164,100%,24%)]/30 v3-bounce">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Solution */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(164,100%,24%)]/[0.08] text-[hsl(164,100%,24%)] text-xs font-bold uppercase tracking-wider mb-5">
                  <span className="w-2 h-2 rounded-full bg-[hsl(164,100%,24%)]" />
                  {slide.solutionLabel}
                </div>
                <V3SolutionVisual slideId={slide.id} />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-5 mt-10">
            <button onClick={prev} className="w-11 h-11 rounded-full border border-[hsl(160,12%,88%)] bg-white hover:bg-[hsl(160,12%,93%)] flex items-center justify-center transition-all shadow-sm">
              <ChevronLeft className="w-5 h-5 text-[hsl(160,8%,45%)]" />
            </button>
            <div className="flex gap-2.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    i === active
                      ? "w-10 bg-[hsl(164,100%,24%)] shadow-sm shadow-[hsl(164,100%,24%)]/30"
                      : "w-2.5 bg-[hsl(160,12%,82%)] hover:bg-[hsl(160,12%,70%)]"
                  }`}
                />
              ))}
            </div>
            <button onClick={next} className="w-11 h-11 rounded-full border border-[hsl(160,12%,88%)] bg-white hover:bg-[hsl(160,12%,93%)] flex items-center justify-center transition-all shadow-sm">
              <ChevronRight className="w-5 h-5 text-[hsl(160,8%,45%)]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Problem Visuals ─── */
const V3ProblemVisual = ({ slideId }: { slideId: string }) => {
  if (slideId === "pipeline") return <V3PipelineProblem />;
  if (slideId === "scatter") return <V3ScatterProblem />;
  return <V3RiskProblem />;
};

const V3SolutionVisual = ({ slideId }: { slideId: string }) => {
  if (slideId === "pipeline") return <V3PipelineSolution />;
  if (slideId === "scatter") return <V3ScatterSolution />;
  return <V3RiskSolution />;
};

const V3PipelineProblem = () => (
  <div className="space-y-3">
    {["Code Change", "PR Review", "CI Build", "Deploy", "Verify"].map((step, i) => (
      <div key={step} className="flex items-center gap-3 v3-stagger" style={{ animationDelay: `${i * 0.07}s` }}>
        <div className="w-9 h-9 rounded-lg bg-[hsl(0,72%,50%)]/[0.08] border border-[hsl(0,72%,50%)]/15 flex items-center justify-center text-sm font-mono text-[hsl(0,72%,50%)]/80 font-bold">
          {i + 1}
        </div>
        <div className="flex-1 h-11 rounded-lg bg-[hsl(160,12%,93%)] border border-[hsl(160,12%,88%)] flex items-center px-4">
          <span className="text-sm text-[hsl(160,8%,45%)] font-medium">{step}</span>
        </div>
        {i < 4 && <span className="text-[hsl(160,8%,45%)]/40 font-bold">→</span>}
      </div>
    ))}
    <div className="text-center text-sm text-[hsl(0,72%,50%)]/70 font-semibold mt-3 pt-3 border-t border-[hsl(0,72%,50%)]/10">
      ⏱ Hours to days per config change
    </div>
  </div>
);

const V3PipelineSolution = () => (
  <div className="space-y-5">
    <div className="flex items-center gap-4 v3-stagger">
      <div className="w-11 h-11 rounded-xl bg-[hsl(164,100%,24%)]/15 border border-[hsl(164,100%,24%)]/25 flex items-center justify-center text-sm font-mono text-[hsl(164,100%,24%)] font-bold">
        1
      </div>
      <div className="flex-1 h-14 rounded-xl bg-[hsl(164,100%,24%)]/[0.05] border border-[hsl(164,100%,24%)]/15 flex items-center px-5">
        <span className="text-base text-[hsl(160,30%,10%)] font-semibold">Update in C Hub</span>
      </div>
    </div>
    <div className="flex justify-center">
      <div className="w-0.5 h-8 bg-[hsl(164,100%,24%)]/30 rounded" />
    </div>
    <div className="grid grid-cols-3 gap-3">
      {["Service A", "Service B", "Service C"].map((s, i) => (
        <div key={s} className="h-16 rounded-xl bg-[hsl(164,100%,24%)]/[0.04] border border-[hsl(164,100%,24%)]/12 flex flex-col items-center justify-center v3-stagger" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
          <span className="text-sm text-[hsl(160,30%,10%)] font-mono font-medium">{s}</span>
          <span className="text-xs text-[hsl(164,100%,24%)] font-semibold">✓ synced</span>
        </div>
      ))}
    </div>
    <div className="text-center text-sm text-[hsl(164,100%,24%)] font-semibold mt-2 pt-3 border-t border-[hsl(164,100%,24%)]/12">
      ⚡ Instant propagation — zero deploys
    </div>
  </div>
);

const V3ScatterProblem = () => (
  <div className="relative min-h-[240px]">
    {[
      { label: ".env.prod", x: "8%", y: "3%", rot: -4 },
      { label: "k8s-configmap", x: "52%", y: "8%", rot: 3 },
      { label: "secrets.yaml", x: "22%", y: "38%", rot: -6 },
      { label: "dashboard UI", x: "58%", y: "48%", rot: 5 },
      { label: "README.md", x: "3%", y: "68%", rot: -2 },
      { label: "wiki page", x: "48%", y: "72%", rot: 3 },
    ].map((item, i) => (
      <div
        key={item.label}
        className="absolute px-3.5 py-2.5 rounded-lg bg-[hsl(0,72%,50%)]/[0.04] border border-[hsl(0,72%,50%)]/12 text-sm font-mono text-[hsl(160,8%,45%)] shadow-sm v3-float"
        style={{ left: item.x, top: item.y, transform: `rotate(${item.rot}deg)`, animationDelay: `${i * 0.5}s` }}
      >
        {item.label}
      </div>
    ))}
    <div className="absolute bottom-0 left-0 right-0 text-center text-sm text-[hsl(0,72%,50%)]/70 font-semibold pt-3 border-t border-[hsl(0,72%,50%)]/10">
      🔍 "Where is that config value?"
    </div>
  </div>
);

const V3ScatterSolution = () => (
  <div className="flex flex-col items-center gap-5">
    <div className="w-full rounded-xl bg-[hsl(164,100%,24%)]/[0.03] border border-[hsl(164,100%,24%)]/15 p-5 shadow-sm">
      <div className="text-sm font-mono text-[hsl(164,100%,24%)] mb-4 text-center font-bold">C Hub — All Configs</div>
      <div className="space-y-2.5">
        {[
          { key: "feature.darkMode", val: "true", env: "prod" },
          { key: "api.rateLimit", val: "1000", env: "all" },
          { key: "cache.ttl", val: "3600", env: "staging" },
          { key: "auth.provider", val: "oauth2", env: "prod" },
        ].map((item, i) => (
          <div key={item.key} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white border border-[hsl(160,12%,88%)] shadow-sm v3-stagger" style={{ animationDelay: `${i * 0.08}s` }}>
            <span className="text-sm text-[hsl(160,30%,10%)] font-mono flex-1 truncate">{item.key}</span>
            <span className="text-xs text-[hsl(164,100%,24%)] bg-[hsl(164,100%,24%)]/[0.08] px-2 py-0.5 rounded-full font-semibold">{item.env}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="text-center text-sm text-[hsl(164,100%,24%)] font-semibold">
      ✅ One place. Every config. Every env.
    </div>
  </div>
);

const V3RiskProblem = () => (
  <div className="space-y-4">
    <div className="rounded-xl bg-[hsl(0,72%,50%)]/[0.04] border border-[hsl(0,72%,50%)]/12 p-5 shadow-sm v3-stagger">
      <div className="text-sm font-mono text-[hsl(0,72%,50%)]/80 mb-3 font-medium">deploy #847 — config update</div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-full h-3 bg-[hsl(0,72%,50%)]/10 rounded-full overflow-hidden">
          <div className="w-3/4 h-full bg-[hsl(0,72%,50%)]/40 rounded-full" />
        </div>
        <span className="text-sm text-[hsl(0,72%,50%)]/70 font-bold">75%</span>
      </div>
      <div className="text-sm text-[hsl(0,72%,50%)]/80 font-semibold">⚠ 3 services affected — rollback?</div>
    </div>
    <div className="rounded-xl bg-[hsl(160,12%,93%)] border border-[hsl(160,12%,88%)] p-4 flex items-center gap-3 v3-stagger" style={{ animationDelay: "0.1s" }}>
      <div className="w-3.5 h-3.5 rounded-full bg-[hsl(0,72%,50%)]/50 animate-pulse" />
      <span className="text-sm text-[hsl(160,8%,45%)]">No audit trail — who changed it?</span>
    </div>
    <div className="rounded-xl bg-[hsl(160,12%,93%)] border border-[hsl(160,12%,88%)] p-4 flex items-center gap-3 v3-stagger" style={{ animationDelay: "0.2s" }}>
      <div className="w-3.5 h-3.5 rounded-full bg-[hsl(38,92%,50%)]/60" />
      <span className="text-sm text-[hsl(160,8%,45%)]">Manual rollback — ETA 2+ hours</span>
    </div>
  </div>
);

const V3RiskSolution = () => (
  <div className="space-y-4">
    <div className="rounded-xl bg-[hsl(164,100%,24%)]/[0.03] border border-[hsl(164,100%,24%)]/15 p-5 shadow-sm">
      <div className="text-sm font-mono text-[hsl(164,100%,24%)] mb-4 font-bold">Version History</div>
      {[
        { ver: "v12", who: "Alice", time: "2m ago", active: true },
        { ver: "v11", who: "Bob", time: "1h ago", active: false },
        { ver: "v10", who: "Alice", time: "3h ago", active: false },
      ].map((v, i) => (
        <div key={v.ver} className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 v3-stagger ${
          v.active
            ? "bg-[hsl(164,100%,24%)]/[0.08] border border-[hsl(164,100%,24%)]/20 shadow-sm"
            : "bg-white border border-[hsl(160,12%,88%)]"
        }`} style={{ animationDelay: `${i * 0.08}s` }}>
          <span className="text-sm font-mono text-[hsl(160,30%,10%)] w-10 font-bold">{v.ver}</span>
          <span className="text-sm text-[hsl(160,8%,45%)] flex-1">{v.who}</span>
          <span className="text-xs text-[hsl(160,8%,45%)]/70">{v.time}</span>
          {!v.active && (
            <button className="text-xs text-[hsl(164,100%,24%)] hover:underline font-semibold">rollback</button>
          )}
        </div>
      ))}
    </div>
    <div className="text-center text-sm text-[hsl(164,100%,24%)] font-semibold">
      🔒 Full audit trail + instant rollback
    </div>
  </div>
);

/* ─── Features strip ─── */
const V3Features = () => (
  <section className="py-16 bg-white border-y border-[hsl(160,12%,88%)]">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {[
          { icon: Radio, label: "Real-Time Sync", desc: "Millisecond propagation" },
          { icon: Shield, label: "Access Control", desc: "Fine-grained RBAC" },
          { icon: GitBranch, label: "Branching", desc: "Config experiments" },
          { icon: Zap, label: "Zero Downtime", desc: "No redeployments" },
        ].map((f, i) => (
          <div key={f.label} className="text-center animate-on-scroll" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="w-14 h-14 rounded-2xl bg-[hsl(164,100%,24%)]/[0.08] border border-[hsl(164,100%,24%)]/12 flex items-center justify-center mx-auto mb-3">
              <f.icon className="w-6 h-6 text-[hsl(164,100%,24%)]" />
            </div>
            <div className="text-base font-bold text-[hsl(160,30%,10%)] mb-1">{f.label}</div>
            <div className="text-sm text-[hsl(160,8%,45%)]">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── CTA ─── */
const V3CTA = () => (
  <section className="py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-white via-[hsl(164,40%,96%)] to-[hsl(60,20%,98%)]" />
    <div className="container mx-auto px-6 relative z-10 text-center animate-on-scroll">
      <h2 className="text-4xl md:text-6xl font-extrabold text-[hsl(160,30%,10%)] mb-5 tracking-tight">
        Ready to simplify your configs?
      </h2>
      <p className="text-xl text-[hsl(160,8%,45%)] max-w-xl mx-auto mb-12 leading-relaxed">
        Join teams who manage their runtime configuration from a single, powerful hub.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl bg-[hsl(164,100%,24%)] text-white text-lg font-semibold shadow-lg shadow-[hsl(164,100%,24%)]/25 hover:bg-[hsl(164,100%,28%)] transition-all hover:scale-[1.02]">
          Start for Free <ArrowRight className="w-5 h-5" />
        </button>
        <button className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl border-2 border-[hsl(164,100%,24%)]/30 text-[hsl(164,100%,24%)] text-lg font-semibold hover:bg-[hsl(164,100%,24%)]/[0.06] transition-all">
          Request a Demo
        </button>
      </div>
    </div>
  </section>
);

/* ─── Footer ─── */
const V3Footer = () => (
  <footer className="border-t border-[hsl(160,12%,88%)] py-12 bg-white">
    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[hsl(164,100%,24%)] flex items-center justify-center">
          <span className="text-white font-mono font-bold text-xs">C</span>
        </div>
        <span className="text-sm text-[hsl(160,8%,45%)] font-medium">C Hub — V3 Bright</span>
      </div>
      <div className="flex items-center gap-6 text-sm text-[hsl(160,8%,45%)]">
        <a href="/" className="hover:text-[hsl(160,30%,10%)] transition-colors">V1</a>
        <a href="/v2" className="hover:text-[hsl(160,30%,10%)] transition-colors">V2</a>
        <a href="#" className="hover:text-[hsl(160,30%,10%)] transition-colors">Documentation</a>
      </div>
    </div>
  </footer>
);

export default IndexV3;
