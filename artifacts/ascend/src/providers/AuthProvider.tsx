import { createContext, useContext, useEffect, useState } from 'react';
import { getAccessToken, setTokens, clearTokens } from '@/lib/api-fetch';

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
        const accessToken = getAccessToken();
        if (!accessToken) {
          setUser(null);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data ?? null);
          return;
        }

        if (res.status === 401) {
          const refreshToken = localStorage.getItem('sb-refresh-token');
          if (refreshToken) {
            const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              setTokens(refreshData.access_token, refreshData.refresh_token);
              setUser(refreshData.user ?? null);
              return;
            }
          }
          clearTokens();
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
    clearTokens();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
