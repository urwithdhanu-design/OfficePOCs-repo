import { Mail, Calendar, Scale, ShieldAlert, Search, ClipboardList, TrendingDown, Gavel, AlertOctagon, Clock } from "lucide-react";
import { sectionPadding, sectionMinHeight } from "@/lib/section-utils";
import { cn } from "@/lib/utils";

const challenges = [
  { icon: Mail, text: "Contracts stored across emails, drives, and folders" },
  { icon: Calendar, text: "Renewal dates are missed" },
  { icon: Scale, text: "Legal review takes days or weeks" },
  { icon: ShieldAlert, text: "Compliance risks detected too late" },
  { icon: Search, text: "Teams spend hours searching documents" },
  { icon: ClipboardList, text: "Contract obligations manually tracked" },
];

const results = [
  { icon: TrendingDown, label: "Revenue leakage" },
  { icon: Gavel, label: "Legal exposure" },
  { icon: AlertOctagon, label: "Compliance failures" },
  { icon: Clock, label: "Operational inefficiency" },
];

const ProblemSection = ({ embedded }: { embedded?: boolean }) => {
  return (
    <section id="problem" className={cn("relative", sectionPadding(embedded), sectionMinHeight(embedded))}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-10 animate-on-scroll">
          <span className="text-sm font-mono text-destructive/80 uppercase tracking-widest mb-3 block">The Problem</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Thousands of contracts. Zero visibility.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Large enterprises manage thousands of contracts — yet most live scattered,
            untracked, and silently creating risk.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-14 animate-on-scroll">
          {challenges.map((item, i) => (
            <div
              key={i}
              className="glass-surface rounded-lg p-5 gradient-border flex items-start gap-3"
            >
              <item.icon className="w-4 h-4 text-destructive/70 mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mb-14 animate-on-scroll">
          <div className="glass-surface rounded-xl p-6 gradient-border">
            <ProblemFlowchart />
          </div>
        </div>

        <div className="max-w-3xl mx-auto animate-on-scroll">
          <p className="text-center text-sm font-mono text-destructive/80 uppercase tracking-widest mb-6">The Result</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results.map((item) => (
              <div key={item.label} className="glass-surface rounded-lg p-5 text-center gradient-border border-destructive/20">
                <item.icon className="w-5 h-5 text-destructive/70 mx-auto mb-2" />
                <p className="text-xs font-medium text-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ProblemFlowchart = () => {
  const nodes = [
    { x: 10, lines: ["Scattered", "Contracts"] },
    { x: 150, lines: ["Missed", "Renewals"] },
    { x: 290, lines: ["Slow", "Legal Review"] },
    { x: 430, lines: ["Late", "Compliance"] },
    { x: 570, lines: ["Business", "Impact"] },
  ];

  return (
    <svg viewBox="0 0 700 120" className="w-full h-auto">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--primary) / 0.5)" />
        </marker>
      </defs>
      {nodes.map((node, i) => (
        <g key={node.x}>
          <rect x={node.x} y="30" width="110" height="60" rx="8" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1" />
          <text x={node.x + 55} y="52" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10">
            <tspan x={node.x + 55} dy="0">{node.lines[0]}</tspan>
            <tspan x={node.x + 55} dy="14">{node.lines[1]}</tspan>
          </text>
          {i < nodes.length - 1 && (
            <line
              x1={node.x + 110}
              y1="60"
              x2={nodes[i + 1].x}
              y2="60"
              stroke="hsl(var(--primary) / 0.5)"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          )}
        </g>
      ))}
    </svg>
  );
};

export default ProblemSection;
