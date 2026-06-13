import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  profileImageUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  getToken: async () => null,
});

export const useAuth = () => useContext(AuthContext);

const MOCK_DEV_USER: AuthUser = { id: 'mock-user-1', email: 'alex@example.com', name: 'Alex Mercer' };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isDev = import.meta.env.DEV;
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange((
      _event: string,
      session: { user: any } | null,
    ) => {
      const u = session?.user;
      if (u) {
        const name =
          (u.user_metadata?.first_name && u.user_metadata?.last_name)
            ? `${u.user_metadata.first_name} ${u.user_metadata.last_name}`.trim()
            : (u.user_metadata?.name ?? u.user_metadata?.full_name ?? undefined);
        setUser({
          id: u.id,
          email: u.email ?? undefined,
          name,
          profileImageUrl: u.user_metadata?.avatar_url ?? u.user_metadata?.picture ?? undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // initial check
    supabase.auth.getSession().then(({ data }: { data: { session: any } | null }) => {
      const u = data?.session?.user;
      if (u) {
        const name =
          (u.user_metadata?.first_name && u.user_metadata?.last_name)
            ? `${u.user_metadata.first_name} ${u.user_metadata.last_name}`.trim()
            : (u.user_metadata?.name ?? u.user_metadata?.full_name ?? undefined);
        setUser({
          id: u.id,
          email: u.email ?? undefined,
          name,
          profileImageUrl: u.user_metadata?.avatar_url ?? u.user_metadata?.picture ?? undefined,
        });
      }
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const effectiveUser = user ?? (isDev ? MOCK_DEV_USER : null);

  return (
    <AuthContext.Provider value={{ user: effectiveUser, loading, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}
