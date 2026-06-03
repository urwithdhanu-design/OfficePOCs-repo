import { useMemo, useState } from "react";
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
import type { ProductData } from "@/types/product";
import { FeatureRecommendations } from "@/components/ai/FeatureRecommendations";
import { CompetitiveBenchmark } from "@/components/ai/CompetitiveBenchmark";
import { FeatureItem } from "../FeatureItem";
import { DroppableZone } from "../DroppableZone";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, GripVertical } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FeaturesStepCompactProps {
  availableFeatures: ProductFeature[];
  selectedFeatures: ProductFeature[];
  productData: ProductData;
  onAddFeature: (feature: ProductFeature) => void;
  onRemoveFeature: (featureId: string) => void;
  onEditFeature?: (feature: ProductFeature) => void;
}

export const FeaturesStepCompact = ({
  availableFeatures,
  selectedFeatures,
  productData,
  onAddFeature,
  onRemoveFeature,
  onEditFeature,
}: FeaturesStepCompactProps) => {
  const [activeFeature, setActiveFeature] = useState<ProductFeature | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedFeatureIds = useMemo(
    () => new Set(selectedFeatures.map((f) => f.id)),
    [selectedFeatures],
  );
  
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
    
    if (over && over.id === "drop-zone-compact") {
      const feature = availableFeatures.find((f) => f.id === active.id);
      if (feature && !selectedFeatures.find((f) => f.id === feature.id)) {
        onAddFeature(feature);
      }
    }
    
    setActiveFeature(null);
  };

  const categories = Array.from(new Set(availableFeatures.map((f) => f.category)));
  
  const getAvailableFeaturesInCategory = (category: string) => {
    const available = availableFeatures.filter(
      (f) => f.category === category && !selectedFeatures.find((sf) => sf.id === f.id)
    );
    
    if (!searchQuery.trim()) return available;
    
    const query = searchQuery.toLowerCase();
    return available.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        f.code.toLowerCase().includes(query)
    );
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <FeatureRecommendations
        productData={productData}
        availableFeatures={availableFeatures}
        selectedFeatureIds={selectedFeatureIds}
        onAddFeature={onAddFeature}
      />
      <CompetitiveBenchmark
        productData={productData}
        availableFeatures={availableFeatures}
        selectedFeatureIds={selectedFeatureIds}
        onAddFeature={onAddFeature}
      />
      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-460px)] min-h-[320px]">
        {/* Available Features with Accordions */}
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0 space-y-2 mb-3">
            <h3 className="text-base font-semibold text-foreground">
              Available Features ({availableFeatures.filter((f) => !selectedFeatures.find((sf) => sf.id === f.id)).length})
            </h3>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1 border rounded-lg">
            <div className="p-3">
              <Accordion type="multiple" className="w-full">
                {categories.map((category) => {
                  const categoryFeatures = getAvailableFeaturesInCategory(category);
                  return (
                    <AccordionItem key={category} value={category} className="border-b last:border-0">
                      <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                        <span className="flex items-center gap-2">
                          {category}
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {categoryFeatures.length}
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <div className="space-y-1.5 mt-1">
                          {categoryFeatures.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">
                              {searchQuery.trim()
                                ? "No features match your search"
                                : "All features added"}
                            </p>
                          ) : (
                            categoryFeatures.map((feature) => (
                              <FeatureItem key={feature.id} feature={feature} compact />
                            ))
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </ScrollArea>
        </div>

        {/* Drop Zone */}
        <div className="flex flex-col h-full">
          <h3 className="text-base font-semibold mb-3 text-foreground flex-shrink-0">
            Selected Features ({selectedFeatures.length})
          </h3>
          <div className="flex-1 overflow-hidden">
            <DroppableZone
              id="drop-zone-compact"
              features={selectedFeatures}
              onRemoveFeature={onRemoveFeature}
              onEditFeature={onEditFeature}
              compact
            />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeFeature ? (
          <div className="bg-card border-2 border-primary rounded-md p-2 shadow-xl opacity-90 cursor-grabbing max-w-sm">
            <div className="flex items-start gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="font-medium text-sm text-card-foreground truncate">{activeFeature.name}</div>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary flex-shrink-0">
                    {activeFeature.category}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground line-clamp-1">{activeFeature.description}</div>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
