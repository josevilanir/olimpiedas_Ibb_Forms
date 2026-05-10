import { Navigate, Outlet } from "react-router";
import { useAuthContext } from "../contexts/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuthContext();
  if (initializing) return null;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
