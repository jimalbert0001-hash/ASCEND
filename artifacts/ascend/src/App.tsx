import { Component, ErrorInfo, ReactNode, useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { Spinner } from "@/components/ui/spinner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";

import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { OnboardingPage } from "@/pages/auth/OnboardingPage";

import { DashboardPage } from "@/pages/DashboardPage";

import { AcademicsOverview } from "@/pages/academics/AcademicsOverview";
import { SubjectsPage } from "@/pages/academics/SubjectsPage";
import { MockTestsPage } from "@/pages/academics/MockTestsPage";
import { RevisionPage } from "@/pages/academics/RevisionPage";
import { AnalyticsPage } from "@/pages/academics/AnalyticsPage";

import { StartupOverview } from "@/pages/startup/StartupOverview";
import { ProjectsPage } from "@/pages/startup/ProjectsPage";
import { RoadmapPage } from "@/pages/startup/RoadmapPage";
import { FeaturesPage } from "@/pages/startup/FeaturesPage";
import { MetricsPage } from "@/pages/startup/MetricsPage";

import { ChessOverview } from "@/pages/chess/ChessOverview";
import { TrainingPage } from "@/pages/chess/TrainingPage";
import { ChessGamesPage } from "@/pages/chess/ChessGamesPage";
import { OpeningsPage } from "@/pages/chess/OpeningsPage";
import { TournamentsPage } from "@/pages/chess/TournamentsPage";
import { ChessAnalytics } from "@/pages/chess/ChessAnalytics";

import { GuitarOverview } from "@/pages/guitar/GuitarOverview";
import { PracticePage } from "@/pages/guitar/PracticePage";
import { SongsPage } from "@/pages/guitar/SongsPage";
import { ProgressPage } from "@/pages/guitar/ProgressPage";

import { AIMentorPage } from "@/pages/AIMentorPage";
import { AchievementsPage } from "@/pages/AchievementsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SettingsPage } from "@/pages/SettingsPage";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[ErrorBoundary]', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive font-bold text-2xl">!</div>
          <h2 className="text-lg font-bold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground max-w-sm">{(this.state.error as Error).message}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, authError } = useAuth();
  const [location, navigate] = useLocation();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (authError) return;
    if (!user) {
      if (location !== '/login') {
        didRedirect.current = true;
        navigate('/login');
      }
      return;
    }
    if (!user.name && location !== '/onboarding') {
      didRedirect.current = true;
      navigate('/onboarding');
      return;
    }
    didRedirect.current = false;
  // navigate is a stable wouter setter (like setState) — excluded from deps to prevent re-render loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, authError, user, location]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Spinner className="size-8 text-muted-foreground" />
      <p className="text-xs text-muted-foreground tracking-widest animate-pulse uppercase">Loading…</p>
    </div>
  );
  if (authError) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm text-destructive">{authError}</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Retry</button>
    </div>
  );
  if (!user) return null;
  if (!user.name && location !== '/onboarding') return null;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/register" component={RegisterPage} />
      <Route path="/auth/forgot-password" component={ForgotPasswordPage} />

      <Route path="/onboarding">
        <ProtectedRoute><OnboardingPage /></ProtectedRoute>
      </Route>

      <Route path="/">
        <ProtectedRoute><AppShell><DashboardPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <Redirect to="/" />
      </Route>

      <Route path="/academics">
        <ProtectedRoute><AppShell><AcademicsOverview /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/academics/subjects">
        <ProtectedRoute><AppShell><SubjectsPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/academics/tests">
        <ProtectedRoute><AppShell><MockTestsPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/academics/revision">
        <ProtectedRoute><AppShell><RevisionPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/academics/analytics">
        <ProtectedRoute><AppShell><AnalyticsPage /></AppShell></ProtectedRoute>
      </Route>

      <Route path="/startup">
        <ProtectedRoute><AppShell><StartupOverview /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/startup/projects">
        <ProtectedRoute><AppShell><ProjectsPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/startup/roadmap">
        <ProtectedRoute><AppShell><RoadmapPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/startup/features">
        <ProtectedRoute><AppShell><FeaturesPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/startup/metrics">
        <ProtectedRoute><AppShell><MetricsPage /></AppShell></ProtectedRoute>
      </Route>

      <Route path="/chess">
        <ProtectedRoute><AppShell><ChessOverview /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/chess/training">
        <ProtectedRoute><AppShell><TrainingPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/chess/games">
        <ProtectedRoute><AppShell><ChessGamesPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/chess/openings">
        <ProtectedRoute><AppShell><OpeningsPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/chess/tournaments">
        <ProtectedRoute><AppShell><TournamentsPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/chess/analytics">
        <ProtectedRoute><AppShell><ChessAnalytics /></AppShell></ProtectedRoute>
      </Route>

      <Route path="/guitar">
        <ProtectedRoute><AppShell><GuitarOverview /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/guitar/practice">
        <ProtectedRoute><AppShell><PracticePage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/guitar/songs">
        <ProtectedRoute><AppShell><SongsPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/guitar/progress">
        <ProtectedRoute><AppShell><ProgressPage /></AppShell></ProtectedRoute>
      </Route>

      <Route path="/ai-mentor">
        <ProtectedRoute><AppShell><AIMentorPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/achievements">
        <ProtectedRoute><AppShell><AchievementsPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute><AppShell><ProfilePage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute><AppShell><SettingsPage /></AppShell></ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
