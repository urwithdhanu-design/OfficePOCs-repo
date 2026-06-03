import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Upload,
  FileText,
  ShieldAlert,
  MessageSquare,
  Sparkles,
  Home,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppControls from "@/components/shared/AppControls";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload Contract", icon: Upload },
  { to: "/summary", label: "AI Summary", icon: FileText },
  { to: "/risk", label: "Risk Center", icon: ShieldAlert },
  { to: "/chat", label: "Contract Chat", icon: MessageSquare },
];

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar flex flex-col">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center glow-primary">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <span className="font-semibold text-sidebar-foreground text-sm">ContractIQ</span>
          <span className="text-sidebar-primary font-semibold text-sm ml-0.5">AI</span>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-sidebar-border">
        <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Signed in as</p>
        <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.username}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        <AppControls compact />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </Button>
        <NavLink
          to="/"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-xs text-sidebar-foreground/70",
            "hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          )}
        >
          <Home className="w-3.5 h-3.5" />
          Back to Home
        </NavLink>
      </div>
    </aside>
  );
};

export default AppSidebar;
