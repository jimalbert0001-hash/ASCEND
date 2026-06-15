import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getAccessToken, setTokens, clearTokens } from '@/lib/api-fetch';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string | null;
  profileImageUrl?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  authError: string | null;
  refreshUser: () => Promise<AuthUser | null>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authError: null,
  refreshUser: async () => null,
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

async function fetchUserWithTimeout(): Promise<AuthUser | null> {
  const accessToken = getAccessToken();
  if (!accessToken) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
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
          signal: controller.signal,
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
  } finally {
    clearTimeout(timer);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const data = await fetchUserWithTimeout();
      setUser(data);
      setAuthError(null);
      return data;
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      setAuthError(isAbort ? 'Request timed out. Please try again.' : 'Failed to connect. Please refresh.');
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchUserWithTimeout()
      .then((data) => {
        setUser(data);
        setAuthError(null);
      })
      .catch((err) => {
        setUser(null);
        const isAbort = err instanceof DOMException && err.name === 'AbortError';
        setAuthError(isAbort ? 'Connection timed out. Please refresh.' : 'Failed to connect. Please refresh.');
      })
      .finally(() => setLoading(false));
  }, []);

  const signOut = () => {
    clearTokens();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, refreshUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
