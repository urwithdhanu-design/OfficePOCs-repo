import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 1, title: "Product Info", description: "Basic details" },
  { id: 2, title: "Features", description: "Drag & drop configuration" },
  { id: 3, title: "System IDs", description: "External mappings" },
  { id: 4, title: "Review", description: "Confirm & export" },
];

interface ProductStepperProps {
  currentStep: number;
}

export const ProductStepper = ({ currentStep }: ProductStepperProps) => {
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center gap-1">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                currentStep > step.id
                  ? "bg-success text-success-foreground"
                  : currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {currentStep > step.id ? (
                <Check className="h-3 w-3" />
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            <span
              className={cn(
                "text-[10px] hidden lg:inline",
                currentStep >= step.id ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {step.title}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={cn(
                "w-4 lg:w-6 h-px mx-1 transition-all duration-300",
                currentStep > step.id ? "bg-success" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};
