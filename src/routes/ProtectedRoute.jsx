import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/**
 * ProtectedRoute
 *
 * Usage:
 *   <ProtectedRoute role="ROLE_USER">  → only logged-in users with ROLE_USER
 *   <ProtectedRoute role="ROLE_ADMIN"> → only logged-in users with ROLE_ADMIN
 *   <ProtectedRoute>                   → any logged-in user
 *
 * AuthContext must expose: { user: { role: "ROLE_USER" | "ROLE_ADMIN" } | null }
 */
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role → go to home
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;