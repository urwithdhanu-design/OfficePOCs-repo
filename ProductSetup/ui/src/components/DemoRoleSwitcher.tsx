import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  Check,
  Shield,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types/user";
import { cn } from "@/lib/utils";

const DEMO_ROLES: Array<{
  role: UserRole;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof Shield;
}> = [
  {
    role: "admin",
    label: "Admin",
    shortLabel: "Admin",
    description: "Approved submissions & system approvals",
    icon: Shield,
  },
  {
    role: "business_manager",
    label: "Business Manager",
    shortLabel: "Manager",
    description: "Review and approve product submissions",
    icon: ShieldCheck,
  },
  {
    role: "business_user",
    label: "Business User",
    shortLabel: "User",
    description: "Configure and submit products",
    icon: UserRound,
  },
];

interface DemoRoleSwitcherProps {
  /** Styling for the green Lloyds header bar */
  variant?: "header" | "default";
}

export function DemoRoleSwitcher({ variant = "default" }: DemoRoleSwitcherProps) {
  const { appUser, loginAsRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [switching, setSwitching] = useState(false);

  if (!appUser) return null;

  const current = DEMO_ROLES.find((r) => r.role === appUser.role) ?? DEMO_ROLES[2];
  const isHeader = variant === "header";

  const handleSwitch = async (role: UserRole) => {
    if (role === appUser.role || switching) return;
    setSwitching(true);
    try {
      await loginAsRole(role);
      navigate("/dashboard", { replace: true });
      const label = DEMO_ROLES.find((r) => r.role === role)?.label ?? role;
      toast({
        title: "Demo role switched",
        description: `You are now viewing as ${label}.`,
      });
    } finally {
      setSwitching(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={isHeader ? "secondary" : "outline"}
          size="sm"
          disabled={switching}
          className={cn(
            "gap-1.5 shrink-0 text-xs sm:text-sm",
            isHeader &&
              "bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 border border-primary-foreground/20",
          )}
        >
          <ArrowLeftRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline sm:inline">Switch</span>
          <Badge
            variant={isHeader ? "secondary" : "outline"}
            className={cn(
              "text-[10px] px-1.5 py-0 font-medium hidden sm:inline-flex",
              isHeader && "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30",
            )}
          >
            {current.shortLabel}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Demo — select user type
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DEMO_ROLES.map(({ role, label, description, icon: Icon }) => (
          <DropdownMenuItem
            key={role}
            className="flex items-start gap-3 py-2.5 cursor-pointer"
            onClick={() => handleSwitch(role)}
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{label}</span>
                {role === appUser.role && (
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-snug mt-0.5">{description}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
