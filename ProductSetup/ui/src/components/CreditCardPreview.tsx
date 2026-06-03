import { useState } from "react";
import { Brand, ProductFeature } from "@/types/product";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CreditCardPreviewProps {
  brands: Brand[];
  productName: string;
  features: ProductFeature[];
  className?: string;
}

const BRAND_STYLES: Record<Brand, { gradient: string; name: string }> = {
  lloyds: {
    gradient: "bg-gradient-to-br from-lloyds via-lloyds to-green-700",
    name: "Lloyds",
  },
  halifax: {
    gradient: "bg-gradient-to-br from-halifax via-blue-500 to-blue-700",
    name: "Halifax",
  },
  bos: {
    gradient: "bg-gradient-to-br from-bos via-blue-900 to-slate-900",
    name: "Bank of Scotland",
  },
  mbna: {
    gradient: "bg-gradient-to-br from-mbna via-orange-600 to-red-600",
    name: "MBNA",
  },
};

export const CreditCardPreview = ({
  brands,
  productName,
  features,
  className,
}: CreditCardPreviewProps) => {
  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  
  const activeBrands = brands.length > 0 ? brands : ["lloyds" as Brand];
  const currentBrand = activeBrands[currentBrandIndex % activeBrands.length];
  const style = BRAND_STYLES[currentBrand];

  const handlePrevBrand = () => {
    setCurrentBrandIndex((prev) => (prev - 1 + activeBrands.length) % activeBrands.length);
  };

  const handleNextBrand = () => {
    setCurrentBrandIndex((prev) => (prev + 1) % activeBrands.length);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Brand navigation */}
      {activeBrands.length > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={handlePrevBrand} className="h-6 w-6">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            {activeBrands.map((brand, index) => (
              <button
                key={brand}
                onClick={() => setCurrentBrandIndex(index)}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all",
                  index === currentBrandIndex % activeBrands.length
                    ? "bg-primary w-3"
                    : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextBrand} className="h-6 w-6">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div
        className={cn(
          "relative w-full aspect-[1.586/1] rounded-xl shadow-lg overflow-hidden transition-all duration-500",
          style.gradient
        )}
      >
        {/* Card shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        
        {/* Card content */}
        <div className="relative h-full p-4 flex flex-col justify-between text-white">
          <div>
            <div className="text-lg font-bold tracking-wide">{style.name}</div>
            <div className="text-xs opacity-90">{productName || "Credit Card"}</div>
          </div>
          
          <div>
            <div className="text-[10px] opacity-75">CARD NUMBER</div>
            <div className="font-mono text-sm tracking-wider">•••• •••• •••• ••••</div>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] opacity-75">VALID THRU</div>
              <div className="font-mono text-xs">••/••</div>
            </div>
            <div className="text-xs font-semibold">CREDIT CARD</div>
          </div>
        </div>
        
        {/* Chip */}
        <div className="absolute top-10 left-4 w-8 h-6 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded opacity-90" />
      </div>

      {/* Selected brands indicator */}
      {activeBrands.length > 1 && (
        <div className="text-center text-[10px] text-muted-foreground">
          {activeBrands.length} brands selected
        </div>
      )}
      
      {/* Collapsible Features list */}
      <Collapsible open={isFeaturesOpen} onOpenChange={setIsFeaturesOpen}>
        <div className="bg-card rounded-lg border">
          <CollapsibleTrigger className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors rounded-lg">
            <span className="font-semibold text-xs text-card-foreground">
              Active Features ({features.length})
            </span>
            {isFeaturesOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 pb-3">
              {features.length === 0 ? (
                <p className="text-xs text-muted-foreground">No features added yet</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {features.map((feature) => (
                    <div key={feature.id} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-card-foreground truncate">{feature.name}</div>
                        <div className="text-[10px] text-muted-foreground">{feature.code}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};
