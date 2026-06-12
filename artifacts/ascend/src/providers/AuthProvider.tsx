import { createContext, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth.store';
import { User, Session } from '@supabase/supabase-js';
import { sampleData } from '../lib/sample-data';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isMock: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  isMock: false
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, session, loading, setUser, setSession, setLoading } = useAuthStore();
  const isMockUrl = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder.supabase.co');

  useEffect(() => {
    if (isMockUrl) {
      // Mock Auth State
      setUser({ id: 'mock-user-1', email: sampleData.user.email, user_metadata: { name: sampleData.user.name } } as unknown as User);
      setSession({ access_token: 'mock-token', user: { id: 'mock-user-1' } } as Session);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isMockUrl, setSession, setUser, setLoading]);

  const signOut = async () => {
    if (isMockUrl) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, isMock: isMockUrl }}>
      {children}
    </AuthContext.Provider>
  );
}
