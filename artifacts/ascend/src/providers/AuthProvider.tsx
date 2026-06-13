import { createContext, useContext, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
  const isMock = !isSupabaseConfigured;

  useEffect(() => {
    if (isMock) {
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
  }, [isMock, setSession, setUser, setLoading]);

  const signOut = async () => {
    if (isMock) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, isMock }}>
      {children}
    </AuthContext.Provider>
  );
}
