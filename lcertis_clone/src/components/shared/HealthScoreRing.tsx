import { cn } from "@/lib/utils";
import { getHealthScoreColor } from "@/lib/contract-utils";

interface HealthScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizes = {
  sm: { ring: 64, stroke: 5, text: "text-lg" },
  md: { ring: 96, stroke: 6, text: "text-2xl" },
  lg: { ring: 128, stroke: 8, text: "text-3xl" },
};

const HealthScoreRing = ({ score, size = "md", showLabel = true }: HealthScoreRingProps) => {
  const { ring, stroke, text } = sizes[size];
  const radius = (ring - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: ring, height: ring }}>
        <svg width={ring} height={ring} className="-rotate-90">
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
          />
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", text, getHealthScoreColor(score))}>{score}</span>
          {showLabel && <span className="text-[10px] text-muted-foreground">/ 100</span>}
        </div>
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Health Score
        </span>
      )}
    </div>
  );
};

export default HealthScoreRing;
