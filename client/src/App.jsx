import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy } from "react";
import { Toaster } from "sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Spinner } from "./components/custom/Spinner";
import { Outlet } from "@tanstack/react-router";
import { AuthProvider } from "./contexts/AuthContext";

// Lazy pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <Spinner size="lg" />
  </div>
);

// ─── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute();

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <LandingPage />
    </Suspense>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <LoginPage />
    </Suspense>
  ),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <RegisterPage />
    </Suspense>
  ),
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <ForgotPasswordPage />
    </Suspense>
  ),
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <ResetPasswordPage />
    </Suspense>
  ),
});

const LayoutLoader = () => (
  <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center">
    <Spinner size="lg" />
  </div>
);

const AuthenticatedLayout = () => (
  <ProtectedRoute>
    <Layout>
      <Suspense fallback={<LayoutLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  </ProtectedRoute>
);

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "authenticated",
  component: AuthenticatedLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/dashboard",
  staticData: {
    title: "Dashboard",
    subtitle: "Welcome back",
  },
  component: DashboardPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/projects",
  staticData: {
    title: "Projects",
    subtitle: "Manage your workspaces",
  },
  component: ProjectsPage,
});

const projectDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/projects/$projectId",
  staticData: {
    title: "Project Detail",
    subtitle: "Viewing project tasks",
  },
  component: ProjectDetailPage,
});

const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/profile",
  staticData: {
    title: "Profile",
    subtitle: "Manage your account",
  },
  component: ProfilePage,
});

const teamRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/team",
  staticData: {
    title: "Team",
    subtitle: "Manage your squad",
  },
  component: TeamPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/reports",
  staticData: {
    title: "Reports",
    subtitle: "Your productivity metrics",
  },
  component: ReportsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/settings",
  staticData: {
    title: "Settings",
    subtitle: "Preferences & Security",
  },
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  layoutRoute.addChildren([
    dashboardRoute,
    projectsRoute,
    projectDetailRoute,
    profileRoute,
    teamRoute,
    reportsRoute,
    settingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                "glass-card border border-white/20 dark:border-white/10 font-body",
              title: "text-foreground font-semibold",
              description: "text-muted-foreground",
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
