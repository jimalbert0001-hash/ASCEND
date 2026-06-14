import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { AuthProvider } from "@/providers/AuthProvider";
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

function Router() {
  return (
    <Switch>
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/register" component={RegisterPage} />
      <Route path="/auth/forgot-password" component={ForgotPasswordPage} />

      <Route path="/">
        <AppShell><DashboardPage /></AppShell>
      </Route>

      <Route path="/academics">
        <AppShell><AcademicsOverview /></AppShell>
      </Route>
      <Route path="/academics/subjects">
        <AppShell><SubjectsPage /></AppShell>
      </Route>
      <Route path="/academics/tests">
        <AppShell><MockTestsPage /></AppShell>
      </Route>
      <Route path="/academics/revision">
        <AppShell><RevisionPage /></AppShell>
      </Route>
      <Route path="/academics/analytics">
        <AppShell><AnalyticsPage /></AppShell>
      </Route>

      <Route path="/startup">
        <AppShell><StartupOverview /></AppShell>
      </Route>
      <Route path="/startup/projects">
        <AppShell><ProjectsPage /></AppShell>
      </Route>
      <Route path="/startup/roadmap">
        <AppShell><RoadmapPage /></AppShell>
      </Route>
      <Route path="/startup/features">
        <AppShell><FeaturesPage /></AppShell>
      </Route>
      <Route path="/startup/metrics">
        <AppShell><MetricsPage /></AppShell>
      </Route>

      <Route path="/chess">
        <AppShell><ChessOverview /></AppShell>
      </Route>
      <Route path="/chess/training">
        <AppShell><TrainingPage /></AppShell>
      </Route>
      <Route path="/chess/games">
        <AppShell><ChessGamesPage /></AppShell>
      </Route>
      <Route path="/chess/openings">
        <AppShell><OpeningsPage /></AppShell>
      </Route>
      <Route path="/chess/tournaments">
        <AppShell><TournamentsPage /></AppShell>
      </Route>
      <Route path="/chess/analytics">
        <AppShell><ChessAnalytics /></AppShell>
      </Route>

      <Route path="/guitar">
        <AppShell><GuitarOverview /></AppShell>
      </Route>
      <Route path="/guitar/practice">
        <AppShell><PracticePage /></AppShell>
      </Route>
      <Route path="/guitar/songs">
        <AppShell><SongsPage /></AppShell>
      </Route>
      <Route path="/guitar/progress">
        <AppShell><ProgressPage /></AppShell>
      </Route>

      <Route path="/ai-mentor">
        <AppShell><AIMentorPage /></AppShell>
      </Route>
      <Route path="/achievements">
        <AppShell><AchievementsPage /></AppShell>
      </Route>
      <Route path="/profile">
        <AppShell><ProfilePage /></AppShell>
      </Route>
      <Route path="/settings">
        <AppShell><SettingsPage /></AppShell>
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
