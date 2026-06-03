import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { sectionPadding, sectionMinHeight } from "@/lib/section-utils";
import { cn } from "@/lib/utils";

const VisionSection = ({ embedded }: { embedded?: boolean }) => {
  return (
    <section className={cn("relative", sectionPadding(embedded), sectionMinHeight(embedded))}>
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto animate-on-scroll">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            From Contract Management to{" "}
            <span className="gradient-text">Autonomous Contract Operations</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Imagine a world where contracts expire, AI detects it, drafts the renewal, schedules
            stakeholder review, and negotiates approved clauses — with just 5 minutes of human
            approval. That&apos;s the future ContractIQ AI is building today.
          </p>
          <Button variant="hero" size="lg" className="px-10 py-6" asChild>
            <Link to="/login">
              Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
