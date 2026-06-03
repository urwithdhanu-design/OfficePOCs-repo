import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExternalSystemId } from "@/types/product";
import { Plus, Trash2 } from "lucide-react";

interface SystemIdsStepProps {
  externalSystems: ExternalSystemId[];
  onUpdateSystem: (index: number, field: "id" | "name" | "system", value: string) => void;
  onAddSystem?: () => void;
  onRemoveSystem?: (index: number) => void;
}

export const SystemIdsStep = ({ 
  externalSystems, 
  onUpdateSystem, 
  onAddSystem, 
  onRemoveSystem 
}: SystemIdsStepProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-card-foreground">
          External System Mappings
        </h3>
        {onAddSystem && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddSystem}
            className="h-7 text-xs gap-1"
          >
            <Plus className="h-3 w-3" />
            Add System
          </Button>
        )}
      </div>
      <div className="grid gap-2">
        {externalSystems.map((system, index) => (
          <div key={index} className="grid grid-cols-[1fr,1.5fr,1.5fr,auto] gap-2 items-center">
            <Input
              placeholder="System name"
              value={system?.system || ""}
              onChange={(e) => onUpdateSystem(index, "system", e.target.value)}
              className="h-8 text-xs"
            />
            <Input
              placeholder="System ID"
              value={system?.id || ""}
              onChange={(e) => onUpdateSystem(index, "id", e.target.value)}
              className="h-8 text-xs"
            />
            <Input
              placeholder="Name (optional)"
              value={system?.name || ""}
              onChange={(e) => onUpdateSystem(index, "name", e.target.value)}
              className="h-8 text-xs"
            />
            {onRemoveSystem && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveSystem(index)}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
