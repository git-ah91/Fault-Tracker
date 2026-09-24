import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { hasPermission } from "@/lib/auth";

interface RoleGuardProps {
  children: ReactNode;
  requiredRoles: string[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, requiredRoles, fallback }: RoleGuardProps) {
  const { user } = useAuth();

  if (!hasPermission(user, requiredRoles)) {
    return fallback || null;
  }

  return <>{children}</>;
}
