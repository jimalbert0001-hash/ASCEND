import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  profileImageUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

async function fetchUser(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/user', { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
  return res.json();
}

const MOCK_DEV_USER: AuthUser = { id: 'mock-user-1', email: 'alex@example.com', name: 'Alex Mercer' };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isDev = import.meta.env.DEV;
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ['/api/auth/user'],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const signOut = () => {
    window.location.href = '/api/logout';
  };

  const effectiveUser = user ?? (isDev ? MOCK_DEV_USER : null);

  return (
    <AuthContext.Provider value={{ user: effectiveUser, loading: isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
