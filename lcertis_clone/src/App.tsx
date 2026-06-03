import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppPreferencesProvider } from "./contexts/AppPreferencesContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import WorkspaceView from "./pages/WorkspaceView";
import Dashboard from "./pages/Dashboard";
import ContractUpload from "./pages/ContractUpload";
import ContractSummary from "./pages/ContractSummary";
import RiskCenter from "./pages/RiskCenter";
import ContractChat from "./pages/ContractChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ScrollAnimationObserver = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "-50px" }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppPreferencesProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ScrollAnimationObserver />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/workspace" element={<WorkspaceView />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<ContractUpload />} />
                <Route path="/summary" element={<ContractSummary />} />
                <Route path="/risk" element={<RiskCenter />} />
                <Route path="/chat" element={<ContractChat />} />
              </Route>
              <Route path="/app" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </AppPreferencesProvider>
  </QueryClientProvider>
);

export default App;
