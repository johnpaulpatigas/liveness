import { Suspense, lazy, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import { api } from "./services/api";

const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));

const ApiKeys = lazy(() => import("./pages/ApiKeys"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Documentation = lazy(() => import("./pages/Documentation"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Login = lazy(() => import("./pages/Login"));
const Logs = lazy(() => import("./pages/Logs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Settings = lazy(() => import("./pages/Settings"));
const Signup = lazy(() => import("./pages/Signup"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Users = lazy(() => import("./pages/Users"));

function PageLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  );
}

function useCurrentUser() {
  const [user, setUser] = useState(() => api.auth.getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(api.auth.getCurrentUser());
    };
    window.addEventListener("auth:expired", handleAuthChange);
    window.addEventListener("auth:login", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth:expired", handleAuthChange);
      window.removeEventListener("auth:login", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return user;
}

function ProtectedRoute({ children }) {
  const user = useCurrentUser();
  const location = useLocation();
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const handleExpired = () => {
      setSessionExpired(true);
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          sessionExpired:
            sessionExpired || Boolean(location.state?.sessionExpired),
        }}
        replace
      />
    );
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}

function PublicOnlyRoute({ children }) {
  const user = useCurrentUser();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function NotFound() {
  const user = useCurrentUser();
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-white px-4 text-center"
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100">
        <span className="text-5xl font-black text-slate-300">404</span>
      </div>
      <h1 className="text-3xl font-black tracking-tight text-slate-900">
        Page not found
      </h1>
      <p className="mt-3 text-sm font-medium text-slate-600">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to={user ? "/dashboard" : "/"}
        className="mt-8 inline-flex items-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
      >
        {user ? "Go to Dashboard" : "Back to Home"}
      </Link>
    </main>
  );
}

const ROUTE_TITLES = {
  "/": "Liveness Cloud | Biometric Identity Platform",
  "/dashboard": "Dashboard | Liveness Cloud",
  "/users": "Identities | Liveness Cloud",
  "/logs": "Verification Logs | Liveness Cloud",
  "/api-keys": "API Keys | Liveness Cloud",
  "/settings": "Account Settings | Liveness Cloud",
  "/docs": "Documentation | Liveness Cloud",
  "/login": "Sign In | Liveness Cloud",
  "/signup": "Create Account | Liveness Cloud",
  "/forgot-password": "Forgot Password | Liveness Cloud",
  "/reset-password": "Reset Password | Liveness Cloud",
  "/privacy": "Privacy Policy | Liveness Cloud",
  "/terms": "Terms of Service | Liveness Cloud",
};

function App() {
  const user = useCurrentUser();
  const location = useLocation();

  // If we navigated to /login or /signup with a background location,
  // render that background location underneath the modal.
  const backgroundLocation = location.state?.backgroundLocation;

  useEffect(() => {
    const currentPath = backgroundLocation?.pathname || location.pathname;
    document.title = ROUTE_TITLES[currentPath] || "Liveness Cloud Console";
    if (!backgroundLocation) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [location.pathname, backgroundLocation]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-blue-600 focus:px-4 focus:py-2.5 focus:text-xs focus:font-bold focus:text-white focus:shadow-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
      >
        Skip to main content
      </a>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes location={backgroundLocation || location}>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Landing />}
          />

          {/* These still work as standalone full-page routes when accessed directly via URL */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPassword />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicOnlyRoute>
                <ResetPassword />
              </PublicOnlyRoute>
            }
          />

          <Route path="/docs" element={<Documentation />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <Logs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/api-keys"
            element={
              <ProtectedRoute>
                <ApiKeys />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Modal routes: rendered on top of the background location */}
      {backgroundLocation && (
        <Suspense fallback={null}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login modal />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <Signup modal />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicOnlyRoute>
                  <ForgotPassword modal />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicOnlyRoute>
                  <ResetPassword modal />
                </PublicOnlyRoute>
              }
            />
          </Routes>
        </Suspense>
      )}
    </>
  );
}

export default App;
