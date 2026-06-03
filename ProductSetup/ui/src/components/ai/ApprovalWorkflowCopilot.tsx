import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardCopy,
  FileText,
  Loader2,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductData } from "@/types/product";
import type { ApprovalCopilotResponse, ApprovalRecommendation } from "@/types/ai";
import { fetchApprovalCopilot } from "@/services/ai-api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const RECOMMENDATION_CONFIG: Record<
  ApprovalRecommendation,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  approve: {
    label: "Recommend approve",
    className: "bg-green-600/10 text-green-700 border-green-200 dark:text-green-400",
    icon: CheckCircle2,
  },
  review_carefully: {
    label: "Review carefully",
    className: "bg-amber-500/10 text-amber-800 border-amber-200 dark:text-amber-400",
    icon: AlertTriangle,
  },
  reject_or_rework: {
    label: "Reject or return for rework",
    className: "bg-destructive/10 text-destructive border-destructive/30",
    icon: XCircle,
  },
};

const SEVERITY_STYLE = {
  high: "border-l-destructive bg-destructive/5",
  medium: "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
  low: "border-l-muted-foreground/40 bg-muted/30",
};

interface ApprovalWorkflowCopilotProps {
  productData: ProductData;
  previousProductData?: ProductData;
  submittedBy?: string;
  onUseRationale?: (text: string) => void;
}

export function ApprovalWorkflowCopilot({
  productData,
  previousProductData,
  submittedBy,
  onUseRationale,
}: ApprovalWorkflowCopilotProps) {
  const [data, setData] = useState<ApprovalCopilotResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchApprovalCopilot(productData, {
        previousProductData,
        submittedBy,
      });
      setData(result);
    } catch {
      setError("Co-Pilot unavailable — is the AI backend running on port 3001?");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [productData, previousProductData, submittedBy]);

  useEffect(() => {
    load();
  }, [load]);

  const copyRationale = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Rationale copied to clipboard." });
  };

  if (loading && !data) {
    return (
      <Card className="border-primary/20 bg-primary/[0.02]">
        <CardContent className="flex items-center gap-2 py-6 justify-center text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Analyzing submission…
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="text-xs">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const rec = RECOMMENDATION_CONFIG[data.recommendation];
  const RecIcon = rec.icon;

  return (
    <Card className="border-primary/25 bg-gradient-to-br from-primary/[0.04] to-card overflow-hidden">
      <CardHeader className="pb-2 border-b border-primary/10">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          Approval Workflow Co-Pilot
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Recommendation badge */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("gap-1 font-medium", rec.className)}>
            <RecIcon className="h-3 w-3" />
            {rec.label}
          </Badge>
          {data.riskFlags.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {data.riskFlags.filter((f) => f.severity === "high").length} high ·{" "}
              {data.riskFlags.filter((f) => f.severity === "medium").length} medium risk flag(s)
            </span>
          )}
        </div>

        {/* Plain English summary */}
        <div className="rounded-lg border bg-card/80 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <FileText className="h-3.5 w-3.5 text-primary" />
            What changed
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{data.plainEnglishSummary}</p>
          {data.changeSummary.length > 1 && (
            <ul className="text-xs text-muted-foreground space-y-1 pl-3 list-disc">
              {data.changeSummary.slice(1, 5).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Risk flags */}
        {data.riskFlags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              Risk flags
            </div>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {data.riskFlags.map((flag) => (
                <div
                  key={flag.ruleId}
                  className={cn(
                    "rounded-md border border-l-[3px] px-2.5 py-2 text-xs",
                    SEVERITY_STYLE[flag.severity],
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-medium">{flag.title}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 capitalize">
                      {flag.severity}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{flag.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Draft rationale */}
        <div className="space-y-2">
          <p className="text-xs font-semibold">Draft rationale</p>
          <Tabs defaultValue="approval">
            <TabsList className="h-8 w-full grid grid-cols-2">
              <TabsTrigger value="approval" className="text-xs">
                Approval
              </TabsTrigger>
              <TabsTrigger value="rejection" className="text-xs">
                Rejection
              </TabsTrigger>
            </TabsList>
            <TabsContent value="approval" className="mt-2">
              <DraftBlock
                text={data.draftApprovalRationale}
                onCopy={() => copyRationale(data.draftApprovalRationale)}
                onUse={
                  onUseRationale
                    ? () => onUseRationale(data.draftApprovalRationale)
                    : undefined
                }
              />
            </TabsContent>
            <TabsContent value="rejection" className="mt-2">
              <DraftBlock
                text={data.draftRejectionRationale}
                onCopy={() => copyRationale(data.draftRejectionRationale)}
                onUse={
                  onUseRationale
                    ? () => onUseRationale(data.draftRejectionRationale)
                    : undefined
                }
              />
            </TabsContent>
          </Tabs>
        </div>

        <Button type="button" variant="outline" size="sm" className="w-full h-8 text-xs" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
          Re-analyze
        </Button>
      </CardContent>
    </Card>
  );
}

function DraftBlock({
  text,
  onCopy,
  onUse,
}: {
  text: string;
  onCopy: () => void;
  onUse?: () => void;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <pre className="text-xs whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed max-h-[140px] overflow-y-auto">
        {text}
      </pre>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={onCopy}>
          <ClipboardCopy className="h-3 w-3 mr-1" />
          Copy
        </Button>
        {onUse && (
          <Button type="button" size="sm" className="h-7 text-xs flex-1" onClick={onUse}>
            Use in review notes
          </Button>
        )}
      </div>
    </div>
  );
}
