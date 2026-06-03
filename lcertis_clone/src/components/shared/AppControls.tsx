import { useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, LayoutGrid, Layers } from "lucide-react";
import { useAppPreferences, type AppTheme, type ViewMode } from "@/contexts/AppPreferencesContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppControlsProps {
  className?: string;
  compact?: boolean;
}

const AppControls = ({ className, compact = false }: AppControlsProps) => {
  const { theme, viewMode, setTheme, setViewMode } = useAppPreferences();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleThemeChange = (next: AppTheme) => {
    setTheme(next);
  };

  const handleViewChange = (next: ViewMode) => {
    setViewMode(next);

    if (next === "single-page") {
      navigate(isAuthenticated ? "/workspace" : "/");
      return;
    }

    if (isAuthenticated) {
      if (location.pathname === "/workspace") {
        navigate("/dashboard");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center rounded-lg border border-border bg-card/80 p-0.5">
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          className={cn(
            "h-8 px-2.5 gap-1.5 text-xs",
            theme === "dark" && "bg-secondary text-foreground"
          )}
          onClick={() => handleThemeChange("dark")}
          title="Dark theme"
        >
          <Moon className="w-3.5 h-3.5" />
          {!compact && "Dark"}
        </Button>
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          className={cn(
            "h-8 px-2.5 gap-1.5 text-xs",
            theme === "lloyds-light" && "bg-secondary text-foreground"
          )}
          onClick={() => handleThemeChange("lloyds-light")}
          title="Lloyds light theme"
        >
          <Sun className="w-3.5 h-3.5" />
          {!compact && "Lloyds"}
        </Button>
      </div>

      <div className="flex items-center rounded-lg border border-border bg-card/80 p-0.5">
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          className={cn(
            "h-8 px-2.5 gap-1.5 text-xs",
            viewMode === "multi-page" && "bg-secondary text-foreground"
          )}
          onClick={() => handleViewChange("multi-page")}
          title="Multi-page navigation"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          {!compact && "Pages"}
        </Button>
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          className={cn(
            "h-8 px-2.5 gap-1.5 text-xs",
            viewMode === "single-page" && "bg-secondary text-foreground"
          )}
          onClick={() => handleViewChange("single-page")}
          title="Tab carousel view"
        >
          <Layers className="w-3.5 h-3.5" />
          {!compact && "Tabs"}
        </Button>
      </div>
    </div>
  );
};

export default AppControls;
