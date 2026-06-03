import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/user";
import { UserRound, ShieldCheck, Shield } from "lucide-react";

const AuthPage: React.FC = () => {
  const { loginAsRole, appUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (!authLoading && appUser) {
      navigate("/dashboard", { replace: true });
    }
  }, [appUser, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (appUser) {
    return null;
  }

  const handleRoleSelect = async (role: UserRole) => {
    await loginAsRole(role);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-muted p-4 sm:p-6">
      <div className="w-full max-w-sm sm:max-w-md space-y-4">
        <Card className="border-primary/20 shadow-lg overflow-hidden">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-md">
              <span className="text-primary-foreground font-bold text-xl sm:text-2xl">L</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl">Lloyds Banking Group</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Product Setup Portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
            <p className="text-center text-xs sm:text-sm text-muted-foreground">
              Select a role to continue
            </p>
            
            <div className="space-y-3">
              <button
                className="w-full py-3 px-3 flex items-center gap-3 rounded-lg border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
                onClick={() => handleRoleSelect("admin")}
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">Admin</div>
                  <div className="text-xs text-muted-foreground">
                    View approved submissions and manage system approvals
                  </div>
                </div>
                <Badge className="bg-primary shrink-0 text-xs">Admin</Badge>
              </button>

              <button
                className="w-full py-3 px-3 flex items-center gap-3 rounded-lg border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
                onClick={() => handleRoleSelect("business_manager")}
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">Business Manager</div>
                  <div className="text-xs text-muted-foreground">
                    Review and approve product submissions
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs">Manager</Badge>
              </button>

              <button
                className="w-full py-3 px-3 flex items-center gap-3 rounded-lg border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
                onClick={() => handleRoleSelect("business_user")}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 border">
                  <UserRound className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">Business User</div>
                  <div className="text-xs text-muted-foreground">
                    Submit product configurations for approval
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs border-foreground/20">User</Badge>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
