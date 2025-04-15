import { Route, Switch, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/Sidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import { useAuth } from "@/hooks/useAuth";

// Lazy load the mobile access page
const MobileAccess = lazy(() => import("@/pages/mobile-access"));

// Lazy load pages for better performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Records = lazy(() => import("@/pages/records"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Family = lazy(() => import("@/pages/family"));
const Appointments = lazy(() => import("@/pages/appointments"));
const Assistant = lazy(() => import("@/pages/assistant"));
const Emergency = lazy(() => import("@/pages/emergency"));
const Profile = lazy(() => import("@/pages/profile"));

function LoadingFallback() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-16 w-16 animate-pulse rounded-full bg-primary/50"></div>
        <p className="text-lg font-medium text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileMenu />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-6">
        <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
      </main>
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Check if we're on GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');
  const basePath = isGitHubPages ? '/medikey' : '';

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path={`${basePath}/login`} component={Login} />
      <Route path={`${basePath}/register`} component={Register} />
      <Route path={`${basePath}/mobile-access`}>
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <MobileAccess />
          </Suspense>
        )}
      </Route>

      {/* Protected routes */}
      {isAuthenticated ? (
        <>
          <Route path={`${basePath}/`}>
            {() => (
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path={`${basePath}/dashboard`}>
            {() => (
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path={`${basePath}/records`}>
            {() => (
              <AuthenticatedLayout>
                <Records />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path={`${basePath}/analytics`}>
            {() => (
              <AuthenticatedLayout>
                <Analytics />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path={`${basePath}/family`}>
            {() => (
              <AuthenticatedLayout>
                <Family />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path={`${basePath}/appointments`}>
            {() => (
              <AuthenticatedLayout>
                <Appointments />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path={`${basePath}/assistant`}>
            {() => (
              <AuthenticatedLayout>
                <Assistant />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path={`${basePath}/emergency`}>
            {() => (
              <AuthenticatedLayout>
                <Emergency />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path={`${basePath}/profile`}>
            {() => (
              <AuthenticatedLayout>
                <Profile />
              </AuthenticatedLayout>
            )}
          </Route>
        </>
      ) : (
        <Route path="*">
          {() => {
            window.location.href = `${basePath}/login`;
            return null;
          }}
        </Route>
      )}

      {/* Fallback 404 route */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
