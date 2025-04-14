import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/Sidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import { useAuth } from "@/hooks/useAuth";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Records = lazy(() => import("@/pages/records"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Family = lazy(() => import("@/pages/family"));
const Appointments = lazy(() => import("@/pages/appointments"));
const Assistant = lazy(() => import("@/pages/assistant"));
const Emergency = lazy(() => import("@/pages/emergency"));

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

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Protected routes */}
      {isAuthenticated ? (
        <>
          <Route path="/">
            {() => (
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/dashboard">
            {() => (
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/records">
            {() => (
              <AuthenticatedLayout>
                <Records />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/analytics">
            {() => (
              <AuthenticatedLayout>
                <Analytics />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/family">
            {() => (
              <AuthenticatedLayout>
                <Family />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/appointments">
            {() => (
              <AuthenticatedLayout>
                <Appointments />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/assistant">
            {() => (
              <AuthenticatedLayout>
                <Assistant />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/emergency">
            {() => (
              <AuthenticatedLayout>
                <Emergency />
              </AuthenticatedLayout>
            )}
          </Route>
        </>
      ) : (
        <Route path="*">
          {() => {
            window.location.href = "/login";
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
