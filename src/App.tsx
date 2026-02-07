import { Suspense, lazy, Component, ReactNode } from "react";
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
import { Loader2, AlertTriangle } from "lucide-react";

// Auth (Static for reliability)
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Landing from "./pages/Landing";

// Onboarding
const Welcome = lazy(() => import("./pages/onboarding/Welcome"));
const LanguageSelect = lazy(() => import("./pages/onboarding/LanguageSelect"));
const ProfileSelect = lazy(() => import("./pages/onboarding/ProfileSelect"));
const NotificationsSetup = lazy(() => import("./pages/onboarding/NotificationsSetup"));
const BiometricSetup = lazy(() => import("./pages/onboarding/BiometricSetup"));

// Main App (Lazy for secondary pages)
const Documents = lazy(() => import("./pages/Documents"));
const Aima = lazy(() => import("./pages/Aima"));
const Notes = lazy(() => import("./pages/Notes"));
const Assistant = lazy(() => import("./pages/Assistant"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const DocumentCategories = lazy(() => import("./pages/settings/DocumentCategories"));
const QuickAccess = lazy(() => import("./pages/settings/QuickAccess"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const MeuBolso = lazy(() => import("./pages/MeuBolso"));
const Community = lazy(() => import("./pages/Community"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Checklist = lazy(() => import("./pages/Checklist"));
const SalaryCalculator = lazy(() => import("./pages/SalaryCalculator"));
const UsefulLinks = lazy(() => import("./pages/UsefulLinks"));
const Emprego = lazy(() => import("./pages/Emprego"));
const Notifications = lazy(() => import("./pages/Notifications"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const About = lazy(() => import("./pages/About"));
const AppInfo = lazy(() => import("./pages/about/AppInfo"));
const Privacy = lazy(() => import("./pages/about/Privacy"));

const queryClient = new QueryClient();

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Ops! Algo deu errado.</h2>
          <p className="text-muted-foreground mb-6">Não foi possível carregar esta parte do aplicativo (Erro 500).</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Recarregar Aplicativo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Carregando VOY...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />

          {/* Onboarding Routes */}
          <Route path="/onboarding/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
          <Route path="/onboarding/language" element={<ProtectedRoute><LanguageSelect /></ProtectedRoute>} />
          <Route path="/onboarding/profile" element={<ProtectedRoute><ProfileSelect /></ProtectedRoute>} />
          <Route path="/onboarding/notifications" element={<ProtectedRoute><NotificationsSetup /></ProtectedRoute>} />
          <Route path="/onboarding/biometric" element={<ProtectedRoute><BiometricSetup /></ProtectedRoute>} />

          {/* Main App Routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/aima" element={<ProtectedRoute><Aima /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings/categories" element={<ProtectedRoute><DocumentCategories /></ProtectedRoute>} />
          <Route path="/settings/quick-access" element={<ProtectedRoute><QuickAccess /></ProtectedRoute>} />
          <Route path="/reset-password" element={<ProtectedRoute><ResetPassword /></ProtectedRoute>} />
          <Route path="/meu-bolso" element={<ProtectedRoute><MeuBolso /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/checklist" element={<ProtectedRoute><Checklist /></ProtectedRoute>} />
          <Route path="/calculator" element={<ProtectedRoute><SalaryCalculator /></ProtectedRoute>} />
          <Route path="/useful-links" element={<ProtectedRoute><UsefulLinks /></ProtectedRoute>} />
          <Route path="/emprego" element={<ProtectedRoute><Emprego /></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/about/info" element={<ProtectedRoute><AppInfo /></ProtectedRoute>} />
          <Route path="/about/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Suspense fallback={<LoadingScreen />}><NotFound /></Suspense>} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
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
