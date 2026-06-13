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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ['/api/auth/user'],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const signOut = () => {
    window.location.href = '/api/logout';
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading: isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
