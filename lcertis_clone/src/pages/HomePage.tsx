import { useAppPreferences } from "@/contexts/AppPreferencesContext";
import Index from "./Index";
import LandingTabView from "./LandingTabView";

const HomePage = () => {
  const { viewMode } = useAppPreferences();

  if (viewMode === "single-page") {
    return <LandingTabView />;
  }

  return <Index />;
};

export default HomePage;
