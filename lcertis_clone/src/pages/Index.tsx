import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WhyItMattersSection from "@/components/landing/WhyItMattersSection";
import ImpactSection from "@/components/landing/ImpactSection";
import VisionSection from "@/components/landing/VisionSection";
import FooterSection from "@/components/landing/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <WhyItMattersSection />
      <ImpactSection />
      <VisionSection />
      <FooterSection />
    </div>
  );
};

export default Index;
