import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Image, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ProcessingStep = {
  label: string;
  status: "pending" | "active" | "complete";
};

const initialSteps: ProcessingStep[] = [
  { label: "Reading Contract", status: "pending" },
  { label: "Extracting Clauses", status: "pending" },
  { label: "Analyzing Risks", status: "pending" },
  { label: "Building Knowledge Graph", status: "pending" },
];

const ContractUpload = ({ onProcessingComplete }: { onProcessingComplete?: () => void }) => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState(initialSteps);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const runProcessing = useCallback((name: string) => {
    setFileName(name);
    setIsProcessing(true);
    setSteps(initialSteps);
    setProgress(0);

    const stepDuration = 1200;
    initialSteps.forEach((_, index) => {
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((step, i) => ({
            ...step,
            status: i < index ? "complete" : i === index ? "active" : "pending",
          }))
        );
        setProgress(((index + 1) / initialSteps.length) * 100);
      }, stepDuration * (index + 1));
    });

    setTimeout(() => {
      setSteps((prev) => prev.map((step) => ({ ...step, status: "complete" })));
      setProgress(100);
      setTimeout(() => {
        if (onProcessingComplete) {
          onProcessingComplete();
        } else {
          navigate("/summary");
        }
      }, 800);
    }, stepDuration * (initialSteps.length + 1));
  }, [navigate, onProcessingComplete]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) runProcessing(file.name);
    },
    [runProcessing]
  );

  const handleFileSelect = () => {
    runProcessing("Enterprise_SaaS_License_Agreement.pdf");
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Upload Contract</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI reads, extracts, and analyzes your contract in seconds
        </p>
      </div>

      {!isProcessing ? (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer",
              isDragging
                ? "border-primary bg-primary/5 glow-primary"
                : "border-border hover:border-primary/50 hover:bg-card/50"
            )}
            onClick={handleFileSelect}
          >
            <Upload className="w-10 h-10 text-primary mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">Drag & Drop your contract</p>
            <p className="text-sm text-muted-foreground mb-6">or click to browse files</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleFileSelect(); }}>
                <FileText className="w-4 h-4 mr-1.5" /> Upload PDF
              </Button>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleFileSelect(); }}>
                <FileText className="w-4 h-4 mr-1.5" /> Upload DOCX
              </Button>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleFileSelect(); }}>
                <Image className="w-4 h-4 mr-1.5" /> Scanned Image
              </Button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { title: "Auto-extract metadata", desc: "Parties, dates, terms" },
              { title: "Risk detection", desc: "Missing clauses & red flags" },
              { title: "Knowledge graph", desc: "Linked obligations & deps" },
            ].map((item) => (
              <Card key={item.title} className="glass-surface">
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="glass-surface gradient-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              AI Processing
            </CardTitle>
            {fileName && (
              <p className="text-sm text-muted-foreground">{fileName}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={progress} className="h-2" />
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.label} className="flex items-center gap-3">
                  {step.status === "complete" ? (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  ) : step.status === "active" ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted shrink-0" />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      step.status === "complete" && "text-success",
                      step.status === "active" && "text-foreground font-medium",
                      step.status === "pending" && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContractUpload;
