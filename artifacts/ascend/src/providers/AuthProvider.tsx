import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  refreshUser: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

async function fetchUser(): Promise<AuthUser | null> {
  const accessToken = getAccessToken();
  if (!accessToken) return null;

  const res = await fetch(`${API_BASE_URL}/api/auth/user`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.ok) {
    return res.json();
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
        return refreshData.user ?? null;
      }
      clearTokens();
    }
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await fetchUser();
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signOut = () => {
    clearTokens();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
