import type { RiskLevel } from "@/data/mockContracts";

export function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: "text-success bg-success/10 border-success/30",
    medium: "text-warning bg-warning/10 border-warning/30",
    high: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    critical: "text-destructive bg-destructive/10 border-destructive/30",
  };
  return colors[level];
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

export function getRiskLabel(level: RiskLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}
