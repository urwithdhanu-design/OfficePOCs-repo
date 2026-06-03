import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductData, ProductFeature } from "@/types/product";
import type { FeatureRecommendation } from "@/types/ai";
import { fetchFeatureRecommendations } from "@/services/ai-api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<
  FeatureRecommendation["type"],
  {
    icon: typeof Lightbulb;
    label: string;
    badgeClass: string;
    cardClass: string;
    iconWrapClass: string;
    accentClass: string;
  }
> = {
  complementary: {
    icon: Sparkles,
    label: "Complementary",
    badgeClass: "bg-sky-500/10 text-sky-700 border-sky-200 dark:text-sky-300 dark:border-sky-800",
    cardClass: "border-sky-200/80 bg-gradient-to-br from-sky-50/90 to-card dark:from-sky-950/30 dark:border-sky-900/50",
    iconWrapClass: "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400",
    accentClass: "border-l-sky-500",
  },
  missing: {
    icon: Lightbulb,
    label: "Similar products",
    badgeClass: "bg-violet-500/10 text-violet-700 border-violet-200 dark:text-violet-300 dark:border-violet-800",
    cardClass: "border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-card dark:from-violet-950/30 dark:border-violet-900/50",
    iconWrapClass: "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400",
    accentClass: "border-l-violet-500",
  },
  conflict: {
    icon: AlertTriangle,
    label: "Conflict",
    badgeClass: "bg-amber-500/10 text-amber-800 border-amber-200 dark:text-amber-300 dark:border-amber-800",
    cardClass: "border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-card dark:from-amber-950/30 dark:border-amber-900/50",
    iconWrapClass: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
    accentClass: "border-l-amber-500",
  },
  compliance: {
    icon: ShieldAlert,
    label: "Compliance",
    badgeClass: "bg-orange-500/10 text-orange-800 border-orange-200 dark:text-orange-300 dark:border-orange-800",
    cardClass: "border-orange-200/80 bg-gradient-to-br from-orange-50/90 to-card dark:from-orange-950/30 dark:border-orange-900/50",
    iconWrapClass: "bg-orange-500/10 text-orange-600 ring-orange-500/20 dark:text-orange-400",
    accentClass: "border-l-orange-500",
  },
  redundant: {
    icon: AlertTriangle,
    label: "Redundant",
    badgeClass: "bg-muted text-muted-foreground border-border",
    cardClass: "border-border bg-gradient-to-br from-muted/50 to-card",
    iconWrapClass: "bg-muted text-muted-foreground ring-border",
    accentClass: "border-l-muted-foreground/40",
  },
};

interface FeatureRecommendationsProps {
  productData: ProductData;
  availableFeatures: ProductFeature[];
  selectedFeatureIds: Set<string>;
  onAddFeature: (feature: ProductFeature) => void;
}

export function FeatureRecommendations({
  productData,
  availableFeatures,
  selectedFeatureIds,
  onAddFeature,
}: FeatureRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<FeatureRecommendation[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [justLoaded, setJustLoaded] = useState(false);

  const featureKey = useMemo(
    () => productData.features.map((f) => f.id).sort().join(","),
    [productData.features],
  );
  const debouncedKey = useDebouncedValue(featureKey, 500);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFeatureRecommendations(productData);
      setRecommendations(result.recommendations);
      setSummary(result.summary);
      setJustLoaded(true);
      window.setTimeout(() => setJustLoaded(false), 800);
    } catch {
      setError("Could not load recommendations. Is the AI backend running on port 3001?");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productData.features.length === 0) {
      setRecommendations([]);
      setSummary("");
      return;
    }
    loadRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKey]);

  const visible = recommendations.filter((r) => !dismissed.has(recKey(r)));

  if (productData.features.length === 0) {
    return (
      <Alert className="mb-3 py-2.5 border-primary/20 bg-primary/[0.03]">
        <Lightbulb className="h-4 w-4 text-primary" />
        <AlertTitle className="text-sm">Smart recommendations</AlertTitle>
        <AlertDescription className="text-xs">
          Add features or use the AI Assistant — recommendations appear once you have a selection.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="recommendations-panel mb-3 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="relative px-4 py-3 border-b border-primary/10 bg-card/60 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20",
                !loading && "animate-recommendation-glow",
              )}
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Smart Feature Recommendations
              </h3>
              {!loading && visible.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {visible.length} insight{visible.length !== 1 ? "s" : ""} for your selection
                </p>
              )}
            </div>
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-primary/70" />
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-colors"
            onClick={loadRecommendations}
            disabled={loading}
          >
            <RefreshCw className={cn("h-3 w-3 mr-1", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {loading && (
          <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-primary/10">
            <div className="h-full w-1/3 rounded-full bg-primary/40 animate-recommendation-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          </div>
        )}
      </div>

      <div className="px-3 py-3 space-y-2">
        {error && (
          <Alert variant="destructive" className="py-2 animate-recommendation-enter">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {!error && !loading && visible.length === 0 && (
          <Alert className="py-2.5 border-primary/15 bg-primary/[0.03] animate-recommendation-enter">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs">
              {summary || "Your selection looks well balanced."}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
          {visible.map((rec, index) => (
            <RecommendationCard
              key={recKey(rec)}
              rec={rec}
              index={index}
              animate={justLoaded}
              availableFeatures={availableFeatures}
              selectedFeatureIds={selectedFeatureIds}
              onAddFeature={onAddFeature}
              onDismiss={() => setDismissed((prev) => new Set(prev).add(recKey(rec)))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({
  rec,
  index,
  animate,
  availableFeatures,
  selectedFeatureIds,
  onAddFeature,
  onDismiss,
}: {
  rec: FeatureRecommendation;
  index: number;
  animate: boolean;
  availableFeatures: ProductFeature[];
  selectedFeatureIds: Set<string>;
  onAddFeature: (feature: ProductFeature) => void;
  onDismiss: () => void;
}) {
  const config = TYPE_CONFIG[rec.type];
  const Icon = config.icon;
  const addableIds = rec.featureIds.filter((id) => !selectedFeatureIds.has(id));
  const canAdd = rec.action === "add" && addableIds.length > 0;

  const handleAddAll = () => {
    for (const id of addableIds) {
      const feature = availableFeatures.find((f) => f.id === id);
      if (feature) onAddFeature(feature);
    }
  };

  return (
    <div
      className={cn(
        "group recommendation-card-highlight relative rounded-lg border border-l-[3px] p-3 text-xs shadow-sm",
        config.cardClass,
        config.accentClass,
        rec.severity === "error" && "border-destructive/40 from-destructive/5 border-l-destructive",
        animate && "animate-recommendation-enter",
      )}
      style={animate ? { animationDelay: `${index * 80}ms` } : undefined}
    >
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-md p-0.5 text-muted-foreground/50 opacity-0 transition-all hover:bg-background/80 hover:text-foreground group-hover:opacity-100 focus:opacity-100"
        aria-label="Dismiss recommendation"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="group flex items-start gap-3 pr-5">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
            config.iconWrapClass,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-foreground leading-snug">{rec.title}</span>
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0 font-medium", config.badgeClass)}
            >
              {config.label}
            </Badge>
          </div>

          <p className="text-muted-foreground leading-relaxed text-[11px]">{rec.reason}</p>

          {addableIds.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {addableIds.map((id) => {
                const name = availableFeatures.find((f) => f.id === id)?.name ?? id;
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="text-[10px] font-normal bg-background/70 hover:bg-background transition-colors"
                  >
                    {name}
                  </Badge>
                );
              })}
            </div>
          )}

          <div className="flex gap-2 pt-0.5">
            {canAdd && (
              <Button
                type="button"
                size="sm"
                className="h-7 text-xs shadow-sm hover:shadow transition-shadow"
                onClick={handleAddAll}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add {addableIds.length > 1 ? "all" : "feature"}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function recKey(rec: FeatureRecommendation): string {
  return `${rec.type}:${[...rec.featureIds].sort().join(",")}`;
}
