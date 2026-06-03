import { useState } from "react";
import { ProductData, BRANDS, AVAILABLE_FEATURES } from "@/types/product";
import { CompetitiveBenchmark } from "@/components/ai/CompetitiveBenchmark";
import { Button } from "@/components/ui/button";
import { Download, FileJson, Send, Loader2, FileText, CreditCard, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { exportToCSV } from "@/utils/csv-export";
import { CreditCardPreview } from "../CreditCardPreview";
import { useToast } from "@/hooks/use-toast";
import { mockApi } from "@/services/mock-api";
import { mockAuthService } from "@/services/mock-auth-service";
import { SubmittedRecordsTable } from "../SubmittedRecordsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReviewStepProps {
  productData: ProductData;
  userId?: string;
  userEmail?: string;
  userRole?: "admin" | "business_manager" | "business_user";
}

export const ReviewStep = ({ productData, userId, userEmail, userRole = "business_user" }: ReviewStepProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCardPreviewOpen, setIsCardPreviewOpen] = useState(false);
  
  const handleExportCSV = () => {
    exportToCSV(productData);
    toast({
      title: "CSV Exported",
      description: "Product configuration has been downloaded successfully.",
    });
  };

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(productData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${productData.productName.replace(/\s+/g, "_")}_config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "JSON Exported",
      description: "Product configuration has been downloaded successfully.",
    });
  };

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    try {
      await mockApi.submitProduct(productData, userId, userEmail);
      if (userId && userEmail) {
        await mockAuthService.logActivity(
          userId, 
          userEmail, 
          "submit_product", 
          `Submitted product "${productData.productName}" for review`
        );
      }
      setSubmitted(true);
      toast({
        title: "Submitted for Review",
        description: "Your product configuration has been submitted for admin approval.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit product configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"review" | "submissions">("review");

  const brandLabels = productData.brands.map((brand) => BRANDS.find((b) => b.value === brand)?.label || brand).join(", ");

  return (
    <div className="space-y-3">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "review" | "submissions")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="review" className="text-xs">
            <Send className="w-3 h-3 mr-1" />
            Review
          </TabsTrigger>
          <TabsTrigger value="submissions" className="text-xs">
            <FileText className="w-3 h-3 mr-1" />
            Submissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="mt-3 space-y-3">
          {/* Header */}
          <div className="text-center py-2">
            <h2 className="text-base font-bold text-foreground">Product Configuration Complete</h2>
            <p className="text-xs text-muted-foreground">Review and submit for approval</p>
          </div>

          {/* Card Preview - Collapsible & Centered */}
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

          <CompetitiveBenchmark
            productData={productData}
            availableFeatures={AVAILABLE_FEATURES}
            selectedFeatureIds={new Set(productData.features.map((f) => f.id))}
            onAddFeature={() => {}}
            defaultOpen
            compact
            readOnly
          />

          {/* Product Summary - Compact */}
          <div className="bg-card border rounded-lg p-3">
            <h3 className="font-semibold text-xs mb-2 text-card-foreground">Product Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="bg-muted/30 rounded p-2">
                <div className="text-muted-foreground text-[10px]">Product Name</div>
                <div className="font-medium text-card-foreground truncate">{productData.productName || "-"}</div>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <div className="text-muted-foreground text-[10px]">Brand(s)</div>
                <div className="font-medium text-card-foreground truncate">{brandLabels || "-"}</div>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <div className="text-muted-foreground text-[10px]">Cardholders</div>
                <div className="font-medium text-card-foreground">{productData.additionalCardholders}</div>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <div className="text-muted-foreground text-[10px]">Features</div>
                <div className="font-medium text-card-foreground">{productData.features.length}</div>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <div className="text-muted-foreground text-[10px]">Systems</div>
                <div className="font-medium text-card-foreground">{productData.externalSystems.filter((s) => s.id).length} mapped</div>
              </div>
            </div>
          </div>

          {/* Configured Features - Compact */}
          {productData.features.length > 0 && (
            <div className="bg-card border rounded-lg p-3">
              <h3 className="font-semibold text-xs mb-2 text-card-foreground">Configured Features</h3>
              <div className="flex flex-wrap gap-1.5">
                {productData.features.map((feature) => (
                  <div key={feature.id} className="flex items-center gap-1 bg-muted/30 rounded-full px-2 py-1 text-[10px]">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span className="font-medium">{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External Systems - Compact */}
          {productData.externalSystems.some((s) => s.id) && (
            <div className="bg-card border rounded-lg p-3">
              <h3 className="font-semibold text-xs mb-2 text-card-foreground">External Systems</h3>
              <div className="flex flex-wrap gap-1.5">
                {productData.externalSystems
                  .filter((s) => s.id)
                  .map((system) => (
                    <div key={system.system} className="bg-muted/30 rounded px-2 py-1 text-[10px]">
                      <span className="font-medium">{system.system}</span>
                      <span className="text-muted-foreground ml-1">({system.id})</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleSubmitForReview} 
              className="w-full h-9 text-xs" 
              disabled={submitting || submitted}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Submitting...
                </>
              ) : submitted ? (
                <>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Submitted for Review
                </>
              ) : (
                <>
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Submit for Review
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button onClick={handleExportCSV} variant="outline" size="sm" className="flex-1 h-8 text-xs">
                <Download className="mr-1 h-3 w-3" />
                CSV
              </Button>
              <Button onClick={handleExportJSON} variant="outline" size="sm" className="flex-1 h-8 text-xs">
                <FileJson className="mr-1 h-3 w-3" />
                JSON
              </Button>
              {submitted && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 h-8 text-xs" 
                  onClick={() => setActiveTab("submissions")}
                >
                  <FileText className="mr-1 h-3 w-3" />
                  View
                </Button>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="mt-3">
          <div className="space-y-2">
            <div>
              <h2 className="text-sm font-bold text-foreground">My Submissions</h2>
              <p className="text-xs text-muted-foreground">Track your submitted configurations</p>
            </div>
            <SubmittedRecordsTable 
              userId={userId} 
              userEmail={userEmail}
              userRole={userRole}
              showAllRecords={false}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
