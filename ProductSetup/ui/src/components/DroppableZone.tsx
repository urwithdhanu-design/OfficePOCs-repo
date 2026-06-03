import { useDroppable } from "@dnd-kit/core";
import { ProductFeature } from "@/types/product";
import { cn } from "@/lib/utils";
import { X, Settings2, Package } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface DroppableZoneProps {
  id: string;
  features: ProductFeature[];
  onRemoveFeature: (featureId: string) => void;
  onEditFeature?: (feature: ProductFeature) => void;
  compact?: boolean;
}

export const DroppableZone = ({ id, features, onRemoveFeature, onEditFeature, compact = false }: DroppableZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const height = compact ? "h-full" : "h-[550px]";
  const padding = compact ? "p-3" : "p-4";
  const itemSpacing = compact ? "space-y-1.5" : "space-y-2";
  const itemPadding = compact ? "p-2" : "p-4";

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-2 border-dashed rounded-lg transition-all flex flex-col",
        padding,
        height,
        isOver ? "border-primary bg-drop-zone-active" : "border-border bg-drop-zone"
      )}
    >
      {features.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className={cn(
            "rounded-full bg-drop-zone/50 flex items-center justify-center mb-3",
            compact ? "w-12 h-12" : "w-16 h-16"
          )}>
            <Package className={cn(
              "text-muted-foreground",
              compact ? "h-6 w-6" : "h-8 w-8"
            )} />
          </div>
          <p className={cn(
            "text-muted-foreground font-medium",
            compact && "text-sm"
          )}>
            Drop features here
          </p>
          <p className={cn(
            "text-muted-foreground mt-1",
            compact ? "text-xs" : "text-sm"
          )}>
            {compact ? "Drag to add" : "Drag features from the left panel to add them"}
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className={itemSpacing}>
            {features.map((feature) => (
              <div
                key={feature.id}
                className={cn(
                  "bg-card border rounded-lg hover:border-primary transition-colors group",
                  itemPadding
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className={cn(
                        "font-medium text-card-foreground",
                        compact && "text-sm truncate"
                      )}>
                        {feature.name}
                      </div>
                      <span className={cn(
                        "rounded-full bg-primary/10 text-primary flex-shrink-0",
                        compact ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-0.5"
                      )}>
                        {feature.category}
                      </span>
                      {feature.value && (
                        <span className={cn(
                          "rounded-full bg-muted text-muted-foreground flex-shrink-0",
                          compact ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-0.5"
                        )}>
                          {feature.value}
                        </span>
                      )}
                    </div>
                    {!compact && (
                      <div className="text-sm text-muted-foreground mt-1">{feature.description}</div>
                    )}
                    <div className={cn(
                      "text-muted-foreground font-mono",
                      compact ? "text-xs mt-0.5" : "text-xs mt-2"
                    )}>
                      {feature.code}
                    </div>
                    {(feature.effectiveDate || feature.priority || feature.notes) && !compact && (
                      <div className="mt-2 pt-2 border-t text-xs space-y-1">
                        {feature.effectiveDate && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">Effective:</span> {feature.effectiveDate}
                          </div>
                        )}
                        {feature.priority && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">Priority:</span> {feature.priority}
                          </div>
                        )}
                        {feature.notes && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">Notes:</span> {feature.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEditFeature && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditFeature(feature)}
                        className={compact ? "h-6 w-6" : "h-8 w-8"}
                      >
                        <Settings2 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveFeature(feature.id)}
                      className={cn(
                        "text-destructive hover:text-destructive",
                        compact ? "h-6 w-6" : "h-8 w-8"
                      )}
                    >
                      <X className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
