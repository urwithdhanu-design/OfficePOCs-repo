import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ProductFeature } from "@/types/product";
import { FeatureItem } from "../FeatureItem";
import { DroppableZone } from "../DroppableZone";
import { FeatureCategories } from "../FeatureCategories";
import { GripVertical } from "lucide-react";

interface FeaturesStepProps {
  availableFeatures: ProductFeature[];
  selectedFeatures: ProductFeature[];
  onAddFeature: (feature: ProductFeature) => void;
  onRemoveFeature: (featureId: string) => void;
  onEditFeature?: (feature: ProductFeature) => void;
}

export const FeaturesStep = ({
  availableFeatures,
  selectedFeatures,
  onAddFeature,
  onRemoveFeature,
  onEditFeature,
}: FeaturesStepProps) => {
  const [activeFeature, setActiveFeature] = useState<ProductFeature | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const feature = availableFeatures.find((f) => f.id === event.active.id);
    if (feature) {
      setActiveFeature(feature);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === "drop-zone") {
      const feature = availableFeatures.find((f) => f.id === active.id);
      if (feature && !selectedFeatures.find((f) => f.id === feature.id)) {
        onAddFeature(feature);
      }
    }
    
    setActiveFeature(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Browse features by category and drag them to add, then click the settings icon to configure attributes
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {/* Available Features with Categories */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              Available Features ({availableFeatures.filter((f) => !selectedFeatures.find((sf) => sf.id === f.id)).length})
            </h3>
            <div className="bg-card border rounded-lg p-3 sm:p-4">
              <FeatureCategories 
                features={availableFeatures} 
                selectedFeatures={selectedFeatures}
              />
            </div>
          </div>

          {/* Drop Zone */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              Selected Features ({selectedFeatures.length})
            </h3>
            <DroppableZone
              id="drop-zone"
              features={selectedFeatures}
              onRemoveFeature={onRemoveFeature}
              onEditFeature={onEditFeature}
            />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeFeature ? (
          <div className="bg-card border-2 border-primary rounded-lg p-4 shadow-xl opacity-90 cursor-grabbing">
            <div className="flex items-start gap-3">
              <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium text-card-foreground">{activeFeature.name}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {activeFeature.category}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{activeFeature.description}</div>
                <div className="text-xs text-muted-foreground mt-2 font-mono">
                  {activeFeature.code}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
