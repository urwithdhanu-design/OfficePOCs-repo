import { useState } from "react";
import { ProductFeature } from "@/types/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeatureItem } from "./FeatureItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FeatureCategoriesProps {
  features: ProductFeature[];
  selectedFeatures: ProductFeature[];
}

export const FeatureCategories = ({ features, selectedFeatures }: FeatureCategoriesProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get unique categories
  const categories = Array.from(new Set(features.map((f) => f.category)));
  
  const getAvailableFeaturesInCategory = (category: string) => {
    const available = features.filter(
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
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search features..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-muted/50 p-2">
          {categories.map((category) => {
            const count = getAvailableFeaturesInCategory(category).length;
            return (
              <TabsTrigger
                key={category}
                value={category}
                className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => {
          const categoryFeatures = getAvailableFeaturesInCategory(category);
          return (
            <TabsContent key={category} value={category} className="mt-4">
              <ScrollArea className="h-[450px] pr-4">
                <div className="space-y-2">
                  {categoryFeatures.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {searchQuery.trim()
                        ? "No features match your search"
                        : "All features from this category have been added"}
                    </p>
                  ) : (
                    categoryFeatures.map((feature) => (
                      <FeatureItem key={feature.id} feature={feature} />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
