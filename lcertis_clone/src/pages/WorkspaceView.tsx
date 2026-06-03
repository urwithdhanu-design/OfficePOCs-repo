import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  FileText,
  ShieldAlert,
  MessageSquare,
  Sparkles,
  LogOut,
} from "lucide-react";
import Dashboard from "./Dashboard";
import ContractUpload from "./ContractUpload";
import ContractSummary from "./ContractSummary";
import RiskCenter from "./RiskCenter";
import ContractChat from "./ContractChat";
import TabCarouselShell from "@/components/shared/TabCarouselShell";
import AppControls from "@/components/shared/AppControls";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const contractTabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "upload", label: "Upload", icon: Upload },
  { id: "summary", label: "AI Summary", icon: FileText },
  { id: "risk", label: "Risk Center", icon: ShieldAlert },
  { id: "chat", label: "Contract Chat", icon: MessageSquare },
];

const WorkspaceView = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSummary = useCallback(() => setActiveIndex(2), []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderContent = (tabId: string) => {
    switch (tabId) {
      case "dashboard":
        return <Dashboard />;
      case "upload":
        return <ContractUpload onProcessingComplete={goToSummary} />;
      case "summary":
        return <ContractSummary />;
      case "risk":
        return <RiskCenter />;
      case "chat":
        return <ContractChat />;
      default:
        return null;
    }
  };

  return (
    <TabCarouselShell
      tabs={contractTabs.map((tab) => ({
        ...tab,
        content: renderContent(tab.id),
      }))}
      activeIndex={activeIndex}
      onActiveIndexChange={setActiveIndex}
      headerLeft={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center glow-primary">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-semibold text-foreground text-sm">ContractIQ</span>
            <span className="text-primary font-semibold text-sm ml-0.5">AI</span>
          </div>
        </div>
      }
      headerCenter={
        <span className="text-xs text-muted-foreground uppercase tracking-widest">
          Contract Dashboard · {user?.username}
        </span>
      }
      headerRight={
        <div className="flex items-center gap-2">
          <AppControls compact />
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={handleLogout}>
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <Link to="/">Home</Link>
          </Button>
        </div>
      }
      renderContent={(tab) => renderContent(tab.id)}
    />
  );
};

export default WorkspaceView;
