import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductStepper } from "@/components/ProductStepper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CreditCard, Save, Shield } from "lucide-react";
import { ProductData, Brand, ProductFeature, ExternalSystemId, AVAILABLE_FEATURES, EXTERNAL_SYSTEMS } from "@/types/product";
import { BasicInfoStep } from "@/components/steps/BasicInfoStep";
import { FeaturesStepCompact } from "@/components/steps/FeaturesStepCompact";
import { SystemIdsStep } from "@/components/steps/SystemIdsStep";
import { ReviewStep } from "@/components/steps/ReviewStep";
import { CreditCardPreview } from "@/components/CreditCardPreview";
import { AuditTrail } from "@/components/AuditTrail";
import { FeatureConfigDialog } from "@/components/FeatureConfigDialog";
import { useProductHistory } from "@/hooks/useProductHistory";
import { useToast } from "@/hooks/use-toast";
import {
  ProductConfigurationAssistant,
  type AssistantApplyMeta,
} from "@/components/ai/ProductConfigurationAssistant";
import { DemoRoleSwitcher } from "@/components/DemoRoleSwitcher";


const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [productData, setProductData] = useState<ProductData>({
    productName: "",
    brands: [],
    additionalCardholders: 0,
    features: [],
    externalSystems: EXTERNAL_SYSTEMS.map((system) => ({ system, id: "", name: "" })),
  });
  const [editingFeature, setEditingFeature] = useState<ProductFeature | null>(null);
  const { auditTrail, versions, addAuditEntry, saveVersion, getVersion, exportAuditTrail } = useProductHistory();
  const { toast } = useToast();

  // Track initial creation
  useEffect(() => {
    if (productData.productName) {
      addAuditEntry({
        action: "created",
        description: `Product "${productData.productName}" initialized`,
      });
    }
  }, []); // Only run once on mount

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddFeature = (feature: ProductFeature) => {
    setProductData((prev) => ({
      ...prev,
      features: [...prev.features, feature],
    }));
    addAuditEntry({
      action: "feature_added",
      field: "features",
      newValue: feature.name,
      description: `Added feature: ${feature.name} (${feature.code})`,
    });
  };

  const handleRemoveFeature = (featureId: string) => {
    const feature = productData.features.find((f) => f.id === featureId);
    setProductData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== featureId),
    }));
    if (feature) {
      addAuditEntry({
        action: "feature_removed",
        field: "features",
        oldValue: feature.name,
        description: `Removed feature: ${feature.name} (${feature.code})`,
      });
    }
  };

  const handleEditFeature = (feature: ProductFeature) => {
    setEditingFeature(feature);
  };

  const handleSaveFeature = (updatedFeature: ProductFeature) => {
    const oldFeature = productData.features.find((f) => f.id === updatedFeature.id);
    setProductData((prev) => ({
      ...prev,
      features: prev.features.map((f) => (f.id === updatedFeature.id ? updatedFeature : f)),
    }));
    
    if (oldFeature) {
      const changes: string[] = [];
      if (oldFeature.value !== updatedFeature.value) changes.push(`value: "${oldFeature.value}" → "${updatedFeature.value}"`);
      if (oldFeature.effectiveDate !== updatedFeature.effectiveDate) changes.push(`effective date: "${oldFeature.effectiveDate}" → "${updatedFeature.effectiveDate}"`);
      if (oldFeature.priority !== updatedFeature.priority) changes.push(`priority: ${oldFeature.priority} → ${updatedFeature.priority}`);
      if (oldFeature.notes !== updatedFeature.notes) changes.push("notes updated");
      
      addAuditEntry({
        action: "feature_updated",
        field: updatedFeature.name,
        description: `Updated feature: ${updatedFeature.name} (${changes.join(", ")})`,
      });
    }
    
    toast({
      title: "Feature Updated",
      description: `${updatedFeature.name} has been configured successfully.`,
    });
  };

  const handleUpdateSystem = (index: number, field: "id" | "name", value: string) => {
    const system = productData.externalSystems[index];
    const oldValue = system[field];
    
    setProductData((prev) => {
      const newSystems = [...prev.externalSystems];
      newSystems[index] = { ...newSystems[index], [field]: value };
      return { ...prev, externalSystems: newSystems };
    });
    
    if (oldValue !== value && value) {
      addAuditEntry({
        action: "system_updated",
        field: `${system.system} - ${field}`,
        oldValue: oldValue || "empty",
        newValue: value,
        description: `Updated ${system.system} ${field}: "${oldValue || "empty"}" → "${value}"`,
      });
    }
  };

  const handleSaveVersion = () => {
    saveVersion(productData, `Version saved at step ${currentStep}`);
    toast({
      title: "Version Saved",
      description: "Current configuration has been saved as a new version.",
    });
  };

  const handleRestoreVersion = (version: number) => {
    const restoredData = getVersion(version);
    if (restoredData) {
      setProductData(restoredData);
      addAuditEntry({
        action: "updated",
        description: `Restored to version ${version}`,
      });
      toast({
        title: "Version Restored",
        description: `Configuration restored to version ${version}.`,
      });
    }
  };

  const handleApplyAssistant = (updated: ProductData, _meta: AssistantApplyMeta) => {
    const previous = productData;
    const previousIds = new Set(previous.features.map((f) => f.id));

    if (updated.productName !== previous.productName) {
      addAuditEntry({
        action: "updated",
        field: "productName",
        oldValue: previous.productName || "empty",
        newValue: updated.productName,
        description: `AI assistant set product name to "${updated.productName}"`,
      });
    }

    for (const feature of updated.features) {
      if (!previousIds.has(feature.id)) {
        addAuditEntry({
          action: "feature_added",
          field: "features",
          newValue: feature.name,
          description: `AI assistant added feature: ${feature.name} (${feature.code})`,
        });
      }
    }

    setProductData(updated);
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return productData.productName.trim() !== "" && productData.brands.length > 0;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-card-foreground">Product Setup</h1>
                <p className="text-sm text-muted-foreground">Configure your credit card products</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DemoRoleSwitcher />
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
              {(currentStep === 1 || currentStep === 2) && (
                <ProductConfigurationAssistant
                  productData={productData}
                  onApply={handleApplyAssistant}
                />
              )}
              <Button variant="outline" size="sm" onClick={handleSaveVersion}>
                <Save className="mr-2 h-4 w-4" />
                Save Version
              </Button>
              <AuditTrail
                auditTrail={auditTrail}
                versions={versions}
                onExportAudit={exportAuditTrail}
                onRestoreVersion={handleRestoreVersion}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-7 px-3 rounded-md bg-primary/10 text-primary flex items-center font-medium text-xs">
              Step {currentStep} of 4
            </div>
            <span className="text-muted-foreground text-sm">
              {currentStep === 1 && "Basic Info"}
              {currentStep === 2 && "Features"}
              {currentStep === 3 && "System IDs"}
              {currentStep === 4 && "Review"}
            </span>
          </div>
        </div>

        {/* Card Preview - Centered */}
        {currentStep !== 4 && (
          <div className="flex justify-center mb-4">
            <CreditCardPreview
              brands={productData.brands}
              productName={productData.productName}
              features={productData.features}
              className="w-full max-w-sm"
            />
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          {/* Step Content */}
          <div className="bg-card border rounded-lg p-4">
            {currentStep === 1 && (
              <BasicInfoStep
                productName={productData.productName}
                brands={productData.brands}
                onProductNameChange={(value) =>
                  setProductData((prev) => ({ ...prev, productName: value }))
                }
                onBrandsChange={(value) =>
                  setProductData((prev) => ({ ...prev, brands: value }))
                }
              />
            )}

            {currentStep === 2 && (
              <FeaturesStepCompact
                availableFeatures={AVAILABLE_FEATURES}
                selectedFeatures={productData.features}
                productData={productData}
                onAddFeature={handleAddFeature}
                onRemoveFeature={handleRemoveFeature}
                onEditFeature={handleEditFeature}
              />
            )}

            {currentStep === 3 && (
              <SystemIdsStep
                externalSystems={productData.externalSystems}
                onUpdateSystem={handleUpdateSystem}
              />
            )}

            {currentStep === 4 && <ReviewStep productData={productData} />}
          </div>
        </div>

        {/* Navigation */}
        {currentStep !== 4 && (
          <div className="flex justify-between mt-4 max-w-3xl mx-auto">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              size="sm"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              size="sm"
            >
              Next
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </main>

      {/* Feature Config Dialog */}
      {editingFeature && (
        <FeatureConfigDialog
          feature={editingFeature}
          open={!!editingFeature}
          onOpenChange={(open) => !open && setEditingFeature(null)}
          onSave={handleSaveFeature}
        />
      )}
    </div>
  );
};

export default Index;
