import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect to="/login" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/register" component={RegisterPage} />
      <Route path="/auth/forgot-password" component={ForgotPasswordPage} />

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

function App() {
  const queryClient = new QueryClient();

  return (
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
  );
}

export default App;
