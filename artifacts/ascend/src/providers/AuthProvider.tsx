import { createContext, useContext, useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/user`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data ?? null);
          return;
        }

        if (res.status === 401) {
          const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            setUser(data ?? null);
            return;
          }
        }

        setUser(null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const signOut = () => {
    window.location.href = `${API_BASE_URL}/api/logout`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
