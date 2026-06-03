import { Link } from "react-router-dom";
import {
  Sparkles,
  Home,
  AlertCircle,
  Lightbulb,
  Bot,
  Heart,
  TrendingUp,
  Rocket,
  FileDown,
} from "lucide-react";
import TabCarouselShell from "@/components/shared/TabCarouselShell";
import AppControls from "@/components/shared/AppControls";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WhyItMattersSection from "@/components/landing/WhyItMattersSection";
import ImpactSection from "@/components/landing/ImpactSection";
import VisionSection from "@/components/landing/VisionSection";
import FooterSection from "@/components/landing/FooterSection";
import { Button } from "@/components/ui/button";

const landingTabs = [
  { id: "overview", label: "Overview", icon: Home, content: <HeroSection embedded /> },
  { id: "problem", label: "Problem", icon: AlertCircle, content: <ProblemSection embedded /> },
  { id: "solution", label: "Solution", icon: Lightbulb, content: <SolutionSection embedded /> },
  { id: "agents", label: "AI Agents", icon: Bot, content: <FeaturesSection embedded /> },
  { id: "why-it-matters", label: "Why It Matters", icon: Heart, content: <WhyItMattersSection embedded /> },
  { id: "impact", label: "Impact", icon: TrendingUp, content: <ImpactSection embedded /> },
  { id: "vision", label: "Vision", icon: Rocket, content: <VisionSection embedded /> },
];

const LandingTabView = () => {
  return (
    <TabCarouselShell
      tabs={landingTabs}
      headerLeft={
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center glow-primary">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-semibold text-foreground text-sm">ContractIQ</span>
            <span className="text-primary font-semibold text-sm ml-0.5">AI</span>
          </div>
        </Link>
      }
      headerCenter={
        <span className="text-xs text-muted-foreground uppercase tracking-widest">
          Platform Overview
        </span>
      }
      headerRight={
        <div className="flex items-center gap-2">
          <AppControls compact />
          <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex" asChild>
            <a href="/ContractIQ-Platform-Overview.pdf" download>
              <FileDown className="w-3.5 h-3.5" />
              PDF
            </a>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      }
      renderContent={(_, index) => (
        <>
          {landingTabs[index].content}
          {index === landingTabs.length - 1 && <FooterSection />}
        </>
      )}
    />
  );
};

export default LandingTabView;
