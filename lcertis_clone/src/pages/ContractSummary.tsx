import { mockContracts } from "@/data/mockContracts";
import { formatCurrency, getRiskColor, getRiskLabel } from "@/lib/contract-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HealthScoreRing from "@/components/shared/HealthScoreRing";
import { cn } from "@/lib/utils";
import {
  Users,
  Calendar,
  RefreshCw,
  XCircle,
  CreditCard,
  ShieldAlert,
} from "lucide-react";

const contract = mockContracts[0];

const metadataCards = [
  { icon: Users, label: "Parties", value: contract.parties.join(" ↔ ") },
  { icon: Calendar, label: "Dates", value: `${contract.startDate} → ${contract.endDate}` },
  { icon: RefreshCw, label: "Renewal Terms", value: contract.renewalTerms },
  { icon: XCircle, label: "Termination Terms", value: contract.terminationTerms },
  { icon: CreditCard, label: "Payment Terms", value: contract.paymentTerms },
  {
    icon: ShieldAlert,
    label: "Risk Score",
    value: `${contract.riskScore}/100 — ${contract.riskScore >= 60 ? "Elevated" : "Moderate"}`,
  },
];

const ContractSummary = () => {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Contract Summary</h1>
          <p className="text-muted-foreground text-sm mt-1">{contract.name}</p>
        </div>
        <HealthScoreRing score={contract.healthScore} size="sm" />
      </div>

      <Card className="glass-surface gradient-border mb-6 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">{contract.summary}</p>
          <div className="flex gap-4 mt-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Contract Value</p>
              <p className="text-lg font-bold text-success">{formatCurrency(contract.value)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10 mt-0.5">
                Expiring Soon
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metadataCards.map((card) => (
          <Card key={card.label} className="glass-surface gradient-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <card.icon className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {card.label}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-surface gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Identified Risks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contract.risks.map((risk) => (
            <div
              key={risk.id}
              className={cn("flex items-start justify-between p-4 rounded-lg border", getRiskColor(risk.level))}
            >
              <div>
                <p className="font-medium text-sm">{risk.title}</p>
                <p className="text-xs mt-1 opacity-80">{risk.description}</p>
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

export default ContractSummary;
