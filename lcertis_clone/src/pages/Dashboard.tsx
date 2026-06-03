import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  IndianRupee,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dashboardStats, aiInsights, mockContracts, formatCurrency } from "@/data/mockContracts";
import { getHealthScoreColor, getRiskColor } from "@/lib/contract-utils";
import HealthScoreRing from "@/components/shared/HealthScoreRing";
import { cn } from "@/lib/utils";

const statCards = [
  { label: "Active Contracts", value: dashboardStats.activeContracts.toLocaleString(), icon: FileText, color: "text-primary" },
  { label: "Expiring Soon", value: dashboardStats.expiringSoon.toString(), icon: Clock, color: "text-warning" },
  { label: "High Risk", value: dashboardStats.highRisk.toString(), icon: AlertTriangle, color: "text-destructive" },
  { label: "Pending Approvals", value: dashboardStats.pendingApprovals.toString(), icon: CheckCircle2, color: "text-accent" },
  { label: "Renewals Due", value: dashboardStats.renewalsDue.toString(), icon: RefreshCw, color: "text-orange-400" },
  { label: "Total Contract Value", value: formatCurrency(dashboardStats.totalValue), icon: IndianRupee, color: "text-success" },
];

const Dashboard = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Contract Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time intelligence across your contract portfolio</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className="glass-surface gradient-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 glass-surface gradient-border border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Today&apos;s Contract Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <p className="text-sm text-foreground">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-surface gradient-border flex flex-col items-center justify-center py-6">
          <CardHeader className="pb-0 text-center">
            <CardTitle className="text-sm text-muted-foreground font-normal uppercase tracking-wider">
              Portfolio Health
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <HealthScoreRing score={84} size="lg" />
            <p className="text-xs text-muted-foreground mt-3 text-center max-w-[180px]">
              Based on risk, compliance, renewals & obligations
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-surface gradient-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Contracts</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/summary">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockContracts.slice(0, 4).map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{contract.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {contract.parties.join(" ↔ ")} · Expires {contract.endDate}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={cn("text-sm font-bold", getHealthScoreColor(contract.healthScore))}>
                    {contract.healthScore}
                  </span>
                  {contract.risks.slice(0, 1).map((risk) => (
                    <Badge key={risk.id} variant="outline" className={cn("text-[10px]", getRiskColor(risk.level))}>
                      {risk.title}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
