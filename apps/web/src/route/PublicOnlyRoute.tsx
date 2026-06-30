import { useAuth } from "@/context/AuthProvider";
import { Navigate } from "react-router";
import { type ChildrenOnlyProps } from "@/components/CommonType";

export function PublicOnlyRoute({ children }: ChildrenOnlyProps) {
  const { isLoading, isAuthenticated, user } = useAuth();
  console.log("public route trigger");
  if (isLoading) {
    return <div></div>;
  }

  if (isAuthenticated) {
    // redirect based on role instead of always going to "/"
    if (user?.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
