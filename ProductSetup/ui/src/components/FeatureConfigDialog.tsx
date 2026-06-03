import { useState } from "react";
import { ProductFeature } from "@/types/product";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FeatureConfigDialogProps {
  feature: ProductFeature;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedFeature: ProductFeature) => void;
}

export const FeatureConfigDialog = ({
  feature,
  open,
  onOpenChange,
  onSave,
}: FeatureConfigDialogProps) => {
  const [formData, setFormData] = useState<ProductFeature>(feature);

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto bg-popover">
        <DialogHeader>
          <DialogTitle>Configure Feature</DialogTitle>
          <DialogDescription>
            Customize the attributes for {feature.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="feature-name">Feature Name</Label>
            <Input
              id="feature-name"
              value={formData.name}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feature-value">Feature Value</Label>
            <Input
              id="feature-value"
              placeholder="e.g., 0%, £50, Enabled"
              value={formData.value || ""}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Specify the value or rate for this feature
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="effective-date">Effective Date</Label>
            <Input
              id="effective-date"
              type="date"
              value={formData.effectiveDate || ""}
              onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority?.toString() || "5"}
              onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) })}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="1">1 - Highest</SelectItem>
                <SelectItem value="2">2 - High</SelectItem>
                <SelectItem value="3">3 - Medium-High</SelectItem>
                <SelectItem value="4">4 - Medium</SelectItem>
                <SelectItem value="5">5 - Normal</SelectItem>
                <SelectItem value="6">6 - Medium-Low</SelectItem>
                <SelectItem value="7">7 - Low</SelectItem>
                <SelectItem value="8">8 - Lowest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or comments..."
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
