import { Navigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";
import { Spinner } from "./custom/Spinner";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" search={{ redirect: location.pathname }} replace />
    );
  }

  return <>{children}</>;
}
