import { useEffect } from 'react';
import { useUiStore } from '../stores/ui.store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
