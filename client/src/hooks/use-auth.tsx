import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AuthUser } from "@/lib/auth";
import { LoginRequest } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ['/api/auth/me'],
    retry: false,
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (response.status === 401) {
          return null;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        return data.user;
      } catch (error) {
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
