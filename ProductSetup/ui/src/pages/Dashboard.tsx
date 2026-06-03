import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LogOut, CreditCard, ArrowLeft, ArrowRight, FileCheck, Shield, ChevronDown, ChevronUp } from "lucide-react";

import { ProductStepper } from "@/components/ProductStepper";
import { ProductData, ProductFeature, ExternalSystemId, AVAILABLE_FEATURES, EXTERNAL_SYSTEMS } from "@/types/product";
import { BasicInfoStep } from "@/components/steps/BasicInfoStep";
import { FeaturesStepCompact } from "@/components/steps/FeaturesStepCompact";
import { SystemIdsStep } from "@/components/steps/SystemIdsStep";
import { ReviewStep } from "@/components/steps/ReviewStep";
import { CreditCardPreview } from "@/components/CreditCardPreview";
import { AuditTrail } from "@/components/AuditTrail";
import { FeatureConfigDialog } from "@/components/FeatureConfigDialog";
import { useProductHistory } from "@/hooks/useProductHistory";


import { SubmittedRecordsTable } from "@/components/SubmittedRecordsTable";
import { MySubmissionsDialog } from "@/components/MySubmissionsDialog";
import { AdminApprovedSubmissions } from "@/components/AdminApprovedSubmissions";
import {
  ProductConfigurationAssistant,
  type AssistantApplyMeta,
} from "@/components/ai/ProductConfigurationAssistant";
import { DemoRoleSwitcher } from "@/components/DemoRoleSwitcher";

const Dashboard: React.FC = () => {
  const { appUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Product setup state for business users
  const [currentStep, setCurrentStep] = useState(1);
  const [isCardPreviewOpen, setIsCardPreviewOpen] = useState(false);
  const [productData, setProductData] = useState<ProductData>({
    productName: "",
    brands: [],
    additionalCardholders: 0,
    features: [],
    externalSystems: EXTERNAL_SYSTEMS.map((system) => ({ system, id: "", name: "" })),
  });
  const [editingFeature, setEditingFeature] = useState<ProductFeature | null>(null);
  const { auditTrail, versions, addAuditEntry, saveVersion, getVersion, exportAuditTrail } = useProductHistory();


  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };


  // Product setup handlers
  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAddFeature = (feature: ProductFeature) => {
    setProductData((prev) => ({ ...prev, features: [...prev.features, feature] }));
    addAuditEntry({
      action: "feature_added",
      field: "features",
      newValue: feature.name,
      description: `Added feature: ${feature.name} (${feature.code})`,
    });
  };

  const handleRemoveFeature = (featureId: string) => {
    const feature = productData.features.find((f) => f.id === featureId);
    setProductData((prev) => ({ ...prev, features: prev.features.filter((f) => f.id !== featureId) }));
    if (feature) {
      addAuditEntry({
        action: "feature_removed",
        field: "features",
        oldValue: feature.name,
        description: `Removed feature: ${feature.name} (${feature.code})`,
      });
    }
  };

  const handleEditFeature = (feature: ProductFeature) => setEditingFeature(feature);

  const handleSaveFeature = (updatedFeature: ProductFeature) => {
    const oldFeature = productData.features.find((f) => f.id === updatedFeature.id);
    setProductData((prev) => ({
      ...prev,
      features: prev.features.map((f) => (f.id === updatedFeature.id ? updatedFeature : f)),
    }));
    if (oldFeature) {
      const changes: string[] = [];
      if (oldFeature.value !== updatedFeature.value) changes.push(`value: "${oldFeature.value}" → "${updatedFeature.value}"`);
      if (oldFeature.effectiveDate !== updatedFeature.effectiveDate) changes.push(`effective date changed`);
      if (oldFeature.priority !== updatedFeature.priority) changes.push(`priority: ${oldFeature.priority} → ${updatedFeature.priority}`);
      addAuditEntry({
        action: "feature_updated",
        field: updatedFeature.name,
        description: `Updated feature: ${updatedFeature.name} (${changes.join(", ")})`,
      });
    }
    toast({ title: "Feature Updated", description: `${updatedFeature.name} has been configured.` });
  };

  const handleUpdateSystem = (index: number, field: "id" | "name" | "system", value: string) => {
    const system = productData.externalSystems[index];
    const oldValue = system[field as keyof ExternalSystemId] as string;
    setProductData((prev) => {
      const newSystems = [...prev.externalSystems];
      newSystems[index] = { ...newSystems[index], [field]: value };
      return { ...prev, externalSystems: newSystems };
    });
    if (oldValue !== value && value && field !== "system") {
      addAuditEntry({
        action: "system_updated",
        field: `${system.system} - ${field}`,
        oldValue: oldValue || "empty",
        newValue: value,
        description: `Updated ${system.system} ${field}`,
      });
    }
  };

  const handleAddSystem = () => {
    setProductData((prev) => ({
      ...prev,
      externalSystems: [...prev.externalSystems, { system: "", id: "", name: "" }],
    }));
  };

  const handleRemoveSystem = (index: number) => {
    const system = productData.externalSystems[index];
    setProductData((prev) => ({
      ...prev,
      externalSystems: prev.externalSystems.filter((_, i) => i !== index),
    }));
    if (system.system) {
      addAuditEntry({
        action: "system_updated",
        field: system.system,
        description: `Removed system: ${system.system}`,
      });
    }
  };

  const handleSaveVersion = () => {
    saveVersion(productData, `Version saved at step ${currentStep}`);
    toast({ title: "Version Saved", description: "Current configuration has been saved." });
  };

  const handleRestoreVersion = (version: number) => {
    const restoredData = getVersion(version);
    if (restoredData) {
      setProductData(restoredData);
      addAuditEntry({ action: "updated", description: `Restored to version ${version}` });
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

    if (updated.brands.join(",") !== previous.brands.join(",")) {
      addAuditEntry({
        action: "updated",
        field: "brands",
        oldValue: previous.brands.join(", ") || "none",
        newValue: updated.brands.join(", "),
        description: "AI assistant updated product brands",
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

    for (const feature of previous.features) {
      if (!updated.features.some((f) => f.id === feature.id)) {
        addAuditEntry({
          action: "feature_removed",
          field: "features",
          oldValue: feature.name,
          description: `AI assistant removed feature: ${feature.name} (${feature.code})`,
        });
      }
    }

    setProductData(updated);
  };

  const isStepValid = () => {
    if (currentStep === 1) return productData.productName.trim() !== "" && productData.brands.length > 0;
    return true;
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      admin: "default",
      business_manager: "secondary",
      business_user: "outline",
    };
    const labels: Record<string, string> = {
      admin: "Admin",
      business_manager: "Business Manager",
      business_user: "Business User",
    };
    return <Badge variant={variants[role] || "outline"}>{labels[role] || role}</Badge>;
  };

  const isBusinessManager = appUser?.role === "business_manager";
  const isAdmin = appUser?.role === "admin";
  const isBusinessUser = appUser?.role === "business_user";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-foreground rounded-full flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-base sm:text-lg">L</span>
            </div>
            <h1 className="text-base sm:text-xl font-semibold truncate hidden sm:block">Lloyds Banking Group</h1>
            <h1 className="text-base font-semibold sm:hidden">Lloyds</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DemoRoleSwitcher variant="header" />
            <Button variant="secondary" size="sm" onClick={handleLogout} className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0 text-xs sm:text-sm">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-3">
        <div className="grid gap-3">

          {/* Product Setup Flow - Business User only */}
          {isBusinessUser && (
            <>
              {/* Header with Stepper and Navigation */}
              <Card
                className={
                  currentStep !== 4
                    ? "sticky top-0 z-20 p-0 overflow-hidden shadow-md border-primary/15 bg-card"
                    : "p-3"
                }
              >
                {currentStep !== 4 && (
                  <>
                    <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3 bg-muted/40 border-b">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="min-w-[92px] sm:min-w-[108px] h-9 sm:h-10 shrink-0"
                      >
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        Back
                      </Button>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
                          Step {currentStep} of 4
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-foreground text-center truncate">
                          {currentStep === 1
                            ? "Product Info"
                            : currentStep === 2
                              ? "Features"
                              : currentStep === 3
                                ? "System IDs"
                                : "Review"}
                        </p>
                        <div className="hidden sm:flex justify-center mt-1.5">
                          <ProductStepper currentStep={currentStep} />
                        </div>
                      </div>
                      <Button
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className="min-w-[92px] sm:min-w-[108px] h-9 sm:h-10 shrink-0"
                      >
                        Next
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex sm:hidden justify-center py-1.5 border-b bg-card">
                      <div className="h-6 px-2.5 rounded-full bg-primary text-primary-foreground flex items-center font-medium text-[10px]">
                        {currentStep === 1
                          ? "Info"
                          : currentStep === 2
                            ? "Features"
                            : currentStep === 3
                              ? "IDs"
                              : "Review"}
                      </div>
                    </div>
                  </>
                )}
                <motion>
                  <motion>
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-xs sm:text-sm">Product Setup</span>
                  </motion>
                  <motion>
                      {(currentStep === 1 || currentStep === 2) && (
                        <ProductConfigurationAssistant
                          productData={productData}
                          onApply={handleApplyAssistant}
                        />
                      )}
                      <MySubmissionsDialog
                        userId={appUser?.uid}
                        userEmail={appUser?.email}
                        userRole={appUser?.role}
                      />
                    </div>
                  </div>
                  
                  {/* Mobile Stepper */}
                  <div className="sm:hidden flex items-center justify-center">
                    <div className="h-6 px-2 rounded-full bg-primary text-primary-foreground flex items-center font-medium text-[10px]">
                      Step {currentStep}/4: {currentStep === 1 ? "Info" : currentStep === 2 ? "Features" : currentStep === 3 ? "IDs" : "Review"}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  {currentStep !== 4 && (
                    <div className="flex justify-between border-t pt-2">
                      <Button variant="outline" size="sm" onClick={handleBack} disabled={currentStep === 1} className="h-7 text-xs">
                        <ArrowLeft className="mr-1 h-3 w-3" />
                        Back
                      </Button>
                      <Button size="sm" onClick={handleNext} disabled={!isStepValid()} className="h-7 text-xs">
                        Next
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Card Preview - Collapsible on Step 2 and 3 */}
              {currentStep !== 4 && (
                (currentStep === 2 || currentStep === 3) ? (
                  <div className="border rounded-lg bg-card">
                    <button 
                      onClick={() => setIsCardPreviewOpen(!isCardPreviewOpen)}
                      className="w-full flex items-center justify-between p-2 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-xs font-medium text-card-foreground flex items-center gap-2">
                        <CreditCard className="h-3.5 w-3.5" />
                        Card Preview & Features ({productData.features.length})
                      </span>
                      {isCardPreviewOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {isCardPreviewOpen && (
                      <div className="px-2 pb-2">
                        <div className="flex justify-center">
                          <CreditCardPreview
                            brands={productData.brands}
                            productName={productData.productName}
                            features={productData.features}
                            className="w-full max-w-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <CreditCardPreview
                      brands={productData.brands}
                      productName={productData.productName}
                      features={productData.features}
                      className="w-full max-w-xs"
                    />
                  </div>
                )
              )}

              {/* Step Content */}
              <Card className="p-3 sm:p-4">
                {currentStep === 1 && (
                  <BasicInfoStep
                    productName={productData.productName}
                    brands={productData.brands}
                    onProductNameChange={(value) => setProductData((prev) => ({ ...prev, productName: value }))}
                    onBrandsChange={(value) => setProductData((prev) => ({ ...prev, brands: value }))}
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
                    onAddSystem={handleAddSystem}
                    onRemoveSystem={handleRemoveSystem}
                  />
                )}

                {currentStep === 4 && (
                  <ReviewStep 
                    productData={productData} 
                    userId={appUser?.uid}
                    userEmail={appUser?.email}
                    userRole={appUser?.role}
                  />
                )}
              </Card>
            </>
          )}


          {/* Product Submissions Review - Business Manager only */}
          {isBusinessManager && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Product Submissions
                </CardTitle>
                <CardDescription>
                  Review and approve product configurations submitted by business users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubmittedRecordsTable
                  userId={appUser?.uid}
                  userEmail={appUser?.email}
                  userRole={appUser?.role}
                  showAllRecords={true}
                />
              </CardContent>
            </Card>
          )}

          {/* Admin View - Approved Submissions with System Approvals */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Approved Submissions
                </CardTitle>
                <CardDescription>
                  View approved product configurations and manage third-party system approvals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminApprovedSubmissions />
              </CardContent>
            </Card>
          )}

        </div>
      </main>

      {/* Feature Config Dialog for business users */}
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

export default Dashboard;
