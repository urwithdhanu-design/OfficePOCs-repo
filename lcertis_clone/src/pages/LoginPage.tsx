import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Sparkles, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppPreferences } from "@/contexts/AppPreferencesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppControls from "@/components/shared/AppControls";

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const { viewMode } = useAppPreferences();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultPath = viewMode === "single-page" ? "/workspace" : "/dashboard";
  const from = (location.state as { from?: string })?.from || defaultPath;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (login(username, password)) {
      navigate(from, { replace: true });
    } else {
      setError("Invalid credentials. Use admin / admin");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center glow-primary">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">
            Contract<span className="text-primary">IQ</span> AI
          </span>
        </Link>
        <AppControls compact />
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md glass-surface gradient-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Access the Contract Intelligence Platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin"
                  autoComplete="current-password"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Credentials: <span className="font-mono">admin</span> / <span className="font-mono">admin</span>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
