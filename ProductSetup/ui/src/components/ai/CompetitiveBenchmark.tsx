import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ProductData, ProductFeature } from "@/types/product";
import type { BenchmarkResponse, CompetitorBenchmark, CompetitorId } from "@/types/ai";
import { fetchCompetitiveBenchmark } from "@/services/ai-api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";

/** Visual slot themes — brand names hidden until unmasked */
const COMPETITOR_SLOTS = [
  {
    index: 1,
    maskedLabel: "Competitor 1",
    theme: {
      bar: "#0f766e",
      bg: "from-teal-500/15 to-teal-500/5",
      border: "border-teal-500/30",
      text: "text-teal-700 dark:text-teal-300",
      ring: "stroke-teal-500",
    },
  },
  {
    index: 2,
    maskedLabel: "Competitor 2",
    theme: {
      bar: "#7c3aed",
      bg: "from-violet-500/15 to-violet-500/5",
      border: "border-violet-500/30",
      text: "text-violet-700 dark:text-violet-300",
      ring: "stroke-violet-500",
    },
  },
  {
    index: 3,
    maskedLabel: "Competitor 3",
    theme: {
      bar: "#2563eb",
      bg: "from-blue-500/15 to-blue-500/5",
      border: "border-blue-500/30",
      text: "text-blue-700 dark:text-blue-300",
      ring: "stroke-blue-500",
    },
  },
] as const;

const ID_ORDER: CompetitorId[] = ["monzo", "starling", "revolut"];

function slotForCompetitor(id: CompetitorId) {
  const idx = ID_ORDER.indexOf(id);
  return COMPETITOR_SLOTS[idx] ?? COMPETITOR_SLOTS[0];
}

function displayName(c: CompetitorBenchmark, unmasked: boolean) {
  const slot = slotForCompetitor(c.competitor);
  return unmasked ? c.label : slot.maskedLabel;
}

interface CompetitiveBenchmarkProps {
  productData: ProductData;
  availableFeatures: ProductFeature[];
  selectedFeatureIds: Set<string>;
  onAddFeature: (feature: ProductFeature) => void;
  defaultOpen?: boolean;
  compact?: boolean;
  readOnly?: boolean;
}

export function CompetitiveBenchmark({
  productData,
  availableFeatures,
  selectedFeatureIds,
  onAddFeature,
  defaultOpen = false,
  compact = false,
  readOnly = false,
}: CompetitiveBenchmarkProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [unmasked, setUnmasked] = useState(false);
  const [data, setData] = useState<BenchmarkResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animateCharts, setAnimateCharts] = useState(false);

  const featureKey = useMemo(
    () => productData.features.map((f) => f.id).sort().join(","),
    [productData.features],
  );
  const debouncedKey = useDebouncedValue(featureKey, 500);

  const load = async () => {
    setLoading(true);
    setError(null);
    setAnimateCharts(false);
    try {
      setData(await fetchCompetitiveBenchmark(productData));
      window.setTimeout(() => setAnimateCharts(true), 50);
    } catch {
      setError("Benchmark unavailable — is the AI backend running on port 3001?");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && productData.features.length > 0) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKey, open]);

  const handleAdd = (featureId: string) => {
    const feature = availableFeatures.find((f) => f.id === featureId);
    if (feature && !selectedFeatureIds.has(featureId)) onAddFeature(feature);
  };

  const sortedCompetitors = useMemo(() => {
    if (!data) return [];
    return [...data.competitors].sort(
      (a, b) => ID_ORDER.indexOf(a.competitor) - ID_ORDER.indexOf(b.competitor),
    );
  }, [data]);

  const totalGaps = sortedCompetitors.reduce((n, c) => n + c.gaps.length, 0);
  const bestMatch = sortedCompetitors.reduce(
    (best, c) => (c.matchPercent > (best?.matchPercent ?? -1) ? c : best),
    sortedCompetitors[0],
  );

  const barChartData = sortedCompetitors.map((c) => ({
    id: c.competitor,
    name: displayName(c, unmasked),
    parity: c.matchPercent,
    covered: c.presentCount,
    gaps: c.gaps.length,
    fill: slotForCompetitor(c.competitor).theme.bar,
  }));

  const radarChartData = useMemo(() => {
    if (!data) return [];
    const metrics = ["Parity", "Coverage", "Gap score"] as const;
    return metrics.map((metric) => {
      const row: Record<string, string | number> = { metric };
      sortedCompetitors.forEach((c) => {
        const key = displayName(c, unmasked);
        const coverage = Math.round((c.presentCount / c.totalBenchmarkFeatures) * 100);
        const gapScore = Math.max(0, 100 - c.gaps.length * 8);
        row[key] =
          metric === "Parity" ? c.matchPercent : metric === "Coverage" ? coverage : gapScore;
      });
      return row;
    });
  }, [data, sortedCompetitors, unmasked]);

  const chartConfig = useMemo(() => {
    const cfg: Record<string, { label: string; color: string }> = {
      parity: { label: "Parity %", color: "hsl(var(--primary))" },
    };
    sortedCompetitors.forEach((c) => {
      const name = displayName(c, unmasked);
      cfg[name] = { label: name, color: slotForCompetitor(c.competitor).theme.bar };
    });
    return cfg;
  }, [sortedCompetitors, unmasked]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn("benchmark-panel rounded-xl shadow-md overflow-hidden", compact ? "mb-2" : "mb-3")}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="relative flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-primary/[0.03] transition-colors"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/25">
              <BarChart3 className="h-4 w-4 text-primary" />
            </span>
            Competitive Benchmarking
            {data && (
              <Badge className="text-[10px] font-semibold bg-primary/90 hover:bg-primary/90">
                {data.overallScore}% parity
              </Badge>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {open ? "Collapse" : "3 competitors · charts & gaps"}
          </span>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-4 pb-4 space-y-4 border-t border-primary/10 bg-card/40 backdrop-blur-sm">
        {loading && (
          <div className="flex flex-col items-center gap-2 py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Building competitive analysis…</p>
            <div className="h-1 w-48 overflow-hidden rounded-full bg-primary/10">
              <div className="h-full w-1/2 rounded-full bg-primary/50 animate-recommendation-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {data && !loading && (
          <div className={cn("space-y-4", animateCharts && "benchmark-animate-in")}>
            {/* Toolbar: unmask + summary */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground max-w-md leading-relaxed">{data.summary}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-dashed"
                onClick={(e) => {
                  e.stopPropagation();
                  setUnmasked((v) => !v);
                }}
              >
                {unmasked ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    Mask names
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    Unmask competitors
                  </>
                )}
              </Button>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <KpiCard icon={Target} label="Avg parity" value={`${data.overallScore}%`} highlight />
              <KpiCard icon={Layers} label="Your features" value={String(productData.features.length)} />
              <KpiCard icon={Zap} label="Total gaps" value={String(totalGaps)} warn={totalGaps > 5} />
              <KpiCard
                icon={TrendingUp}
                label="Strongest match"
                value={bestMatch ? displayName(bestMatch, unmasked) : "—"}
                sub={bestMatch ? `${bestMatch.matchPercent}%` : undefined}
              />
            </div>

            {/* Visualizations row */}
            {!compact && (
              <div className="grid sm:grid-cols-2 gap-3">
                {/* Parity bar chart */}
                <div className="rounded-xl border bg-card/80 p-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Parity by competitor
                  </p>
                  <ChartContainer config={chartConfig} className="h-[160px] w-full aspect-auto">
                    <BarChart data={barChartData} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                      <YAxis type="category" dataKey="name" width={unmasked ? 72 : 88} tick={{ fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="parity" radius={[0, 4, 4, 0]} barSize={14}>
                        {barChartData.map((entry) => (
                          <Cell key={entry.id} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>

                {/* Radar multi-metric */}
                <div className="rounded-xl border bg-card/80 p-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Multi-metric profile
                  </p>
                  <ChartContainer config={chartConfig} className="h-[160px] w-full aspect-auto">
                    <RadarChart data={radarChartData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid className="stroke-border/60" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9 }} />
                      {sortedCompetitors.map((c) => {
                        const name = displayName(c, unmasked);
                        return (
                          <Radar
                            key={c.competitor}
                            name={name}
                            dataKey={name}
                            stroke={slotForCompetitor(c.competitor).theme.bar}
                            fill={slotForCompetitor(c.competitor).theme.bar}
                            fillOpacity={0.15}
                            strokeWidth={2}
                          />
                        );
                      })}
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ChartContainer>
                  <div className="flex flex-wrap justify-center gap-2 mt-1">
                    {sortedCompetitors.map((c) => {
                      const slot = slotForCompetitor(c.competitor);
                      return (
                        <span key={c.competitor} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                          <span className="h-2 w-2 rounded-full" style={{ background: slot.theme.bar }} />
                          {displayName(c, unmasked)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Competitor score cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {sortedCompetitors.map((c, i) => {
                const slot = slotForCompetitor(c.competitor);
                return (
                  <div
                    key={c.competitor}
                    className={cn(
                      "rounded-xl border p-3 bg-gradient-to-br shadow-sm transition-transform hover:scale-[1.02]",
                      slot.theme.bg,
                      slot.theme.border,
                      animateCharts && "benchmark-animate-in",
                    )}
                    style={animateCharts ? { animationDelay: `${i * 80}ms` } : undefined}
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <div>
                        <p className={cn("text-xs font-bold", slot.theme.text)}>
                          {displayName(c, unmasked)}
                        </p>
                        {unmasked && (
                          <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">{c.tagline}</p>
                        )}
                      </div>
                      <ScoreRing percent={c.matchPercent} ringClass={slot.theme.ring} />
                    </div>
                    <div className="h-2 rounded-full bg-background/60 overflow-hidden mb-1.5">
                      <div
                        className="h-full rounded-full benchmark-bar-fill"
                        style={{
                          width: `${c.matchPercent}%`,
                          backgroundColor: slot.theme.bar,
                          animationDelay: `${i * 100 + 200}ms`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{c.presentCount}/{c.totalBenchmarkFeatures} covered</span>
                      <span className={c.gaps.length > 0 ? "text-amber-600 font-medium" : "text-green-600"}>
                        {c.gaps.length} gap{c.gaps.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Common gaps */}
            {data.commonGaps.length > 0 && (
              <div className="rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50/80 to-card dark:from-amber-950/20 p-3 space-y-2">
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-600" />
                  High-impact gaps (missing vs 2+ competitors)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.commonGaps.slice(0, 8).map((gap) => (
                    <div
                      key={gap.featureId}
                      className="flex items-center gap-1 rounded-lg border bg-background/90 pl-2 pr-1 py-1 shadow-sm"
                    >
                      <span className="text-[10px] font-medium">{gap.featureName}</span>
                      <Badge variant="secondary" className="text-[9px] px-1 py-0">
                        {gap.missingFrom.length}/3
                      </Badge>
                      {!readOnly && !selectedFeatureIds.has(gap.featureId) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 hover:bg-primary/10"
                          onClick={() => handleAdd(gap.featureId)}
                        >
                          <Plus className="h-3 w-3 text-primary" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detail tabs */}
            <Tabs defaultValue={sortedCompetitors[0]?.competitor ?? "monzo"}>
              <TabsList className="h-9 w-full grid grid-cols-3 bg-muted/50">
                {sortedCompetitors.map((c) => (
                  <TabsTrigger key={c.competitor} value={c.competitor} className="text-[10px] sm:text-xs px-1">
                    {displayName(c, unmasked)}
                  </TabsTrigger>
                ))}
              </TabsList>
              {sortedCompetitors.map((c) => {
                const slot = slotForCompetitor(c.competitor);
                return (
                  <TabsContent key={c.competitor} value={c.competitor} className="mt-2 space-y-2">
                    {unmasked && (
                      <p className="text-[10px] text-muted-foreground italic border-l-2 border-primary/30 pl-2">
                        {c.tagline}
                      </p>
                    )}
                    {c.gaps.length > 0 ? (
                      <div className={cn("space-y-1.5 overflow-y-auto", compact ? "max-h-[120px]" : "max-h-[160px]")}>
                        {c.gaps.map((gap, gi) => (
                          <div
                            key={gap.featureId}
                            className={cn(
                              "flex items-start justify-between gap-2 rounded-lg border p-2.5 text-xs bg-card/90",
                              "benchmark-animate-in",
                            )}
                            style={{ animationDelay: `${gi * 40}ms` }}
                          >
                            <div className="min-w-0 border-l-2 pl-2" style={{ borderColor: slot.theme.bar }}>
                              <p className="font-semibold">{gap.featureName}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{gap.reason}</p>
                              <Badge variant="outline" className="text-[9px] mt-1 font-normal">
                                {gap.category}
                              </Badge>
                            </div>
                            {!readOnly && !selectedFeatureIds.has(gap.featureId) && (
                              <Button
                                type="button"
                                size="sm"
                                className="h-7 shrink-0 text-[10px] px-2"
                                style={{ backgroundColor: slot.theme.bar }}
                                onClick={() => handleAdd(gap.featureId)}
                              >
                                <Plus className="h-3 w-3 mr-0.5" />
                                Add
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-center py-4 text-green-600 font-medium">
                        Full parity with this competitor profile
                      </p>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs w-full border-primary/20"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", loading && "animate-spin")} />
              Refresh benchmark
            </Button>
          </div>
        )}

        {productData.features.length === 0 && !loading && (
          <p className="text-xs text-muted-foreground py-3 text-center">
            Select features to benchmark against three anonymised competitor profiles
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
  warn,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-2.5 bg-card/90 shadow-sm",
        highlight && "border-primary/30 bg-primary/[0.04]",
        warn && "border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/20",
      )}
    >
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-muted-foreground font-medium">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className={cn("text-lg font-bold tabular-nums mt-0.5", highlight && "text-primary")}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function ScoreRing({ percent, ringClass }: { percent: number; ringClass: string }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="relative h-11 w-11 shrink-0">
      <svg className="h-11 w-11 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" className="stroke-muted/40" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          className={cn(ringClass, "transition-all duration-700 ease-out")}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
        {percent}%
      </span>
    </div>
  );
}
