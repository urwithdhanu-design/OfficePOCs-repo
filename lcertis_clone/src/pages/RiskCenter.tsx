import { mockContracts } from "@/data/mockContracts";
import { getRiskColor, getRiskLabel } from "@/lib/contract-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const riskLevels = ["low", "medium", "high", "critical"] as const;

const allRisks = mockContracts.flatMap((c) =>
  c.risks.map((r) => ({ ...r, contractName: c.name, contractId: c.id }))
);

const riskCounts = {
  low: allRisks.filter((r) => r.level === "low").length,
  medium: allRisks.filter((r) => r.level === "medium").length,
  high: allRisks.filter((r) => r.level === "high").length,
  critical: allRisks.filter((r) => r.level === "critical").length,
};

const heatmapColors: Record<string, string> = {
  low: "bg-success/20 border-success/40 hover:bg-success/30",
  medium: "bg-warning/20 border-warning/40 hover:bg-warning/30",
  high: "bg-orange-400/20 border-orange-400/40 hover:bg-orange-400/30",
  critical: "bg-destructive/20 border-destructive/40 hover:bg-destructive/30",
};

const RiskCenter = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Risk Center</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Portfolio-wide risk heatmap and flagged clauses
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {riskLevels.map((level) => (
          <Card key={level} className={cn("glass-surface border", getRiskColor(level))}>
            <CardContent className="p-5 text-center">
              <p className="text-3xl font-bold">{riskCounts[level]}</p>
              <p className="text-xs uppercase tracking-wider mt-1">{getRiskLabel(level)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-surface gradient-border mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Risk Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {riskLevels.map((level) => (
              <div key={level} className="text-center text-xs text-muted-foreground uppercase tracking-wider py-1">
                {getRiskLabel(level)}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {mockContracts.map((contract) => (
              <div key={contract.id} className="grid grid-cols-[200px_1fr] gap-2 items-center">
                <p className="text-xs text-muted-foreground truncate pr-2">{contract.name}</p>
                <div className="grid grid-cols-4 gap-2">
                  {riskLevels.map((level) => {
                    const count = contract.risks.filter((r) => r.level === level).length;
                    return (
                      <div
                        key={level}
                        className={cn(
                          "h-10 rounded-md border flex items-center justify-center text-sm font-medium transition-colors",
                          count > 0 ? heatmapColors[level] : "bg-muted/30 border-border/30 text-muted-foreground/40"
                        )}
                      >
                        {count > 0 ? count : "—"}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-surface gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Flagged Risk Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allRisks.map((risk) => (
            <div
              key={`${risk.contractId}-${risk.id}`}
              className={cn("flex items-start justify-between p-4 rounded-lg border", getRiskColor(risk.level))}
            >
              <div>
                <p className="font-medium text-sm">{risk.title}</p>
                <p className="text-xs mt-1 opacity-80">{risk.description}</p>
                <p className="text-[10px] text-muted-foreground mt-2">{risk.contractName}</p>
              </div>
              <Badge variant="outline" className={cn("text-[10px] shrink-0 ml-3", getRiskColor(risk.level))}>
                {getRiskLabel(risk.level)}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskCenter;
