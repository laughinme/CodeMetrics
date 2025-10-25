import { Navigate, Outlet, useLocation, useRoutes, type Location, type RouteObject } from "react-router-dom";
import DashboardPage from "@/pages/Dashboard";
import DevelopersPage from "@/pages/Developers";
import DeveloperProfilePage from "@/pages/DeveloperProfilePage";
import InsightsPage from "@/pages/Insights";
import AuthPage from "@/pages/auth/ui/AuthPage";
import ProjectsPage from "@/pages/Projects";
import TimelinePage from "@/pages/Timeline";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import RepoDetailPage from "@/pages/RepoDetailPage";
import { useAuth } from "@/app/providers/auth/useAuth";

const RequireAuth = () => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth) {
    throw new Error("Auth context is unavailable. Wrap routes with <AuthProvider>.");
  }

  if (!auth.user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

const RedirectIfAuthenticated = () => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth) {
    throw new Error("Auth context is unavailable. Wrap routes with <AuthProvider>.");
  }

  if (auth.user) {
    const state = location.state as { from?: Location } | undefined;
    const from = state?.from;
    const targetPath =
      from && from.pathname && from.pathname !== "/auth" ? from.pathname : "/dashboard";

    return <Navigate to={targetPath} replace />;
  }

  return <AuthPage />;
};

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "projects/:projectId", element: <ProjectDetailPage /> },
      { path: "projects/:projectId/repos/:repoId", element: <RepoDetailPage /> },
      { path: "timeline", element: <TimelinePage /> },
      { path: "repositories", element: <Navigate to="/timeline" replace /> },
      { path: "developers", element: <DevelopersPage /> },
      { path: "developers/:developerId", element: <DeveloperProfilePage /> },
      { path: "insights", element: <InsightsPage /> }
    ]
  },
  {
    path: "/auth",
    element: <RedirectIfAuthenticated />
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />
  }
];

export const AppRoutes = () => {
  return useRoutes(routes);
};
