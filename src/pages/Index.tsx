import { Navigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { hasCompletedOnboarding, isProfileLoading } = useApp();

  if (isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Bypass onboarding and go straight to home
  return <Navigate to="/home" replace />;
};

export default Index;
