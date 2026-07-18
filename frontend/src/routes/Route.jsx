import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useContext";
import { FullScreenSpinner } from "../components/ui/Spinner";

export const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/login" />;
  return <Navigate to="/dashboard" />;
};

export const PublicRoutes = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

export const ProtectedRoutes = ({ children }) => {
  const { user, loading, logout, refreshUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    refreshUser();
  }, [refreshUser, location.pathname]);

  if (loading) return <FullScreenSpinner label="Restoring your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.status && user.status.toLowerCase() !== "active") {
    logout();
    return <Navigate to="/login" replace />;
  }

  return children;
};
