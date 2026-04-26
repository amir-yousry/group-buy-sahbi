import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: "consumer" | "organizer";
  requireKyc?: boolean;
}

export function ProtectedRoute({
  children,
  requireRole,
  requireKyc,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  if (requireKyc && user.kycStatus !== "approved") {
    if (user.kycStatus === "none") return <Navigate to="/kyc" replace />;
    return <Navigate to="/verification-status" replace />;
  }

  return <>{children}</>;
}
