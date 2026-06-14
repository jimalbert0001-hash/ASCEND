import { createContext, useContext, useEffect, useState } from 'react';

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
    fetch('/api/auth/user', { credentials: 'include' })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        setUser(data ?? null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signOut = () => {
    window.location.href = '/api/logout';
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
