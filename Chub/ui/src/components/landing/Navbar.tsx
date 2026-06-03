import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl animate-fade-down">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center glow-primary">
            <span className="text-primary font-mono font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-foreground text-lg">Hub</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Onboarding</a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground">Sign In</Button>
          <Button variant="default" size="sm">Get Started</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
