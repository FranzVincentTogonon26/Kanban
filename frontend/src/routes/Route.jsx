import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useContext";
import { FullScreenSpinner } from "../components/ui/Spinner";

export const RootRedirect = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  if (!user) return <Navigate to={user ? "/dashboard" : "/login"} />;
  return children;
};

export const PublicRoutes = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

export const ProtectedRoutes = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenSpinner label="Restoring your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
};
