import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BRANDS, Brand } from "@/types/product";

interface BasicInfoStepProps {
  productName: string;
  brands: Brand[];
  onProductNameChange: (value: string) => void;
  onBrandsChange: (value: Brand[]) => void;
}

export const BasicInfoStep = ({
  productName,
  brands,
  onProductNameChange,
  onBrandsChange,
}: BasicInfoStepProps) => {
  const handleBrandToggle = (brand: Brand, checked: boolean) => {
    if (checked) {
      onBrandsChange([...brands, brand]);
    } else {
      onBrandsChange(brands.filter((b) => b !== brand));
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="space-y-1.5">
        <Label htmlFor="productName" className="text-xs font-medium">Product Name</Label>
        <Input
          id="productName"
          placeholder="Enter product name"
          value={productName}
          onChange={(e) => onProductNameChange(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Product Brands</Label>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((b) => (
            <label
              key={b.value}
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded-full cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10 text-xs"
            >
              <Checkbox
                checked={brands.includes(b.value)}
                onCheckedChange={(checked) => handleBrandToggle(b.value, checked as boolean)}
                className="h-3.5 w-3.5"
              />
              <span className="font-medium text-foreground">{b.label}</span>
            </label>
          ))}
        </div>
        {brands.length === 0 && (
          <p className="text-[10px] text-destructive">Please select at least one brand</p>
        )}
      </div>
    </div>
  );
};
