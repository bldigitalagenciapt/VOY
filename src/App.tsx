import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppProvider } from "@/contexts/AppContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { OnboardingTour } from "@/components/OnboardingTour";
import ScrollToTop from "@/components/ScrollToTop";
// Auth
import Auth from "./pages/Auth";

// Onboarding
import Welcome from "./pages/onboarding/Welcome";
import LanguageSelect from "./pages/onboarding/LanguageSelect";
import ProfileSelect from "./pages/onboarding/ProfileSelect";
import NotificationsSetup from "./pages/onboarding/NotificationsSetup";
import BiometricSetup from "./pages/onboarding/BiometricSetup";

// Main App
import Home from "./pages/Home";
import Documents from "./pages/Documents";
import Aima from "./pages/Aima";
import Notes from "./pages/Notes";
import Assistant from "./pages/Assistant";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import DocumentCategories from "./pages/settings/DocumentCategories";
import QuickAccess from "./pages/settings/QuickAccess";
import ResetPassword from "./pages/ResetPassword";
import MeuBolso from "./pages/MeuBolso";
import Community from "./pages/Community";
import Agenda from "./pages/Agenda";
import Checklist from "./pages/Checklist";
import SalaryCalculator from "./pages/SalaryCalculator";
import UsefulLinks from "./pages/UsefulLinks";
import Emprego from "./pages/Emprego";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root: Index redireciona para /home ou /onboarding/welcome conforme hasCompletedOnboarding */}
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />

      {/* Auth Route */}
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />

      {/* Onboarding Routes */}
      <Route
        path="/onboarding/welcome"
        element={
          <ProtectedRoute>
            <Welcome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/language"
        element={
          <ProtectedRoute>
            <LanguageSelect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/profile"
        element={
          <ProtectedRoute>
            <ProfileSelect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/notifications"
        element={
          <ProtectedRoute>
            <NotificationsSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/biometric"
        element={
          <ProtectedRoute>
            <BiometricSetup />
          </ProtectedRoute>
        }
      />

      {/* Main App Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aima"
        element={
          <ProtectedRoute>
            <Aima />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <Assistant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/categories"
        element={
          <ProtectedRoute>
            <DocumentCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/quick-access"
        element={
          <ProtectedRoute>
            <QuickAccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <ProtectedRoute>
            <ResetPassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meu-bolso"
        element={
          <ProtectedRoute>
            <MeuBolso />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checklist"
        element={
          <ProtectedRoute>
            <Checklist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calculator"
        element={
          <ProtectedRoute>
            <SalaryCalculator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/useful-links"
        element={
          <ProtectedRoute>
            <UsefulLinks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emprego"
        element={
          <ProtectedRoute>
            <Emprego />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agenda"
        element={
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <ThemeProvider>
            <Toaster />
            <Sonner />
            <OnboardingTour />
            <BrowserRouter>
              <ScrollToTop />
              <AppRoutes />
            </BrowserRouter>
          </ThemeProvider>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
