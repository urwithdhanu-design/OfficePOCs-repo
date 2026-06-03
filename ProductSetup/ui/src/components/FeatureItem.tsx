import { useDraggable } from "@dnd-kit/core";
import { ProductFeature } from "@/types/product";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureItemProps {
  feature: ProductFeature;
  compact?: boolean;
}

export const FeatureItem = ({ feature, compact = false }: FeatureItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: feature.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "bg-card border rounded-md p-2 transition-all hover:border-primary cursor-grab active:cursor-grabbing touch-none",
          isDragging && "opacity-50"
        )}
        {...listeners}
        {...attributes}
      >
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="font-medium text-sm text-card-foreground truncate">{feature.name}</div>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary flex-shrink-0">
                {feature.category}
              </span>
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2 mb-1">{feature.description}</div>
            <div className="text-xs text-muted-foreground font-mono">
              {feature.code}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border rounded-lg p-4 transition-all hover:border-primary cursor-grab active:cursor-grabbing touch-none",
        isDragging && "opacity-50"
      )}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-medium text-card-foreground">{feature.name}</div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {feature.category}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">{feature.description}</div>
          <div className="text-xs text-muted-foreground mt-2 font-mono">{feature.code}</div>
        </div>
      </div>
    </div>
  );
};
