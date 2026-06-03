import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAppPreferences } from "@/contexts/AppPreferencesContext";
import AppLayout from "./AppLayout";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const { viewMode } = useAppPreferences();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (viewMode === "single-page" && location.pathname !== "/workspace") {
    return <Navigate to="/workspace" replace />;
  }

  if (viewMode === "multi-page" && location.pathname === "/workspace") {
    return <Navigate to="/dashboard" replace />;
  }

  if (viewMode === "single-page") {
    return <Outlet />;
  }

  return <AppLayout />;
};

export default ProtectedRoute;
