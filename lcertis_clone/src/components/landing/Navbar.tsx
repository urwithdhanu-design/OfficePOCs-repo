import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppControls from "@/components/shared/AppControls";
import { useAuth } from "@/contexts/AuthContext";
import { useAppPreferences } from "@/contexts/AppPreferencesContext";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { viewMode } = useAppPreferences();
  const navigate = useNavigate();

  const platformLink = isAuthenticated
    ? viewMode === "single-page"
      ? "/workspace"
      : "/dashboard"
    : "/login";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl animate-fade-down">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center glow-primary">
            <span className="text-primary font-mono font-bold text-sm">IQ</span>
          </div>
          <span className="font-semibold text-foreground text-lg">
            Contract<span className="text-primary">IQ</span> AI
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <a href="#problem" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Problem</a>
          <a href="#solution" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Solution</a>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI Agents</a>
          <a href="#why-it-matters" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Why It Matters</a>
        </div>

        <div className="flex items-center gap-3">
          <AppControls compact className="hidden sm:flex" />
          <Button variant="outline" size="sm" className="gap-1.5 hidden md:flex" asChild>
            <a href="/ContractIQ-Platform-Overview.pdf" download>
              Download PDF
            </a>
          </Button>
          {isAuthenticated ? (
            <>
              <span className="text-xs text-muted-foreground hidden md:inline">{user?.username}</span>
              <Button variant="ghost" size="sm" asChild>
                <Link to={platformLink}>Platform</Link>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleLogout}>
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link to={platformLink}>Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
