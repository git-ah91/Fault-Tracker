import { User } from "@shared/schema";

export interface AuthUser extends Omit<User, 'password'> {}

export const hasPermission = (user: AuthUser | null, requiredRoles: string[]): boolean => {
  if (!user) return false;
  return requiredRoles.includes(user.role);
};

export const canEdit = (user: AuthUser | null): boolean => {
  return hasPermission(user, ['editor', 'admin']);
};

export const canAdmin = (user: AuthUser | null): boolean => {
  return hasPermission(user, ['admin']);
};
