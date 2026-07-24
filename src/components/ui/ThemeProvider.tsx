import React, { createContext, useContext, useEffect, useState } from 'react';
import { applyCssVariables } from './tokens';

type Theme = 'light' | 'dark';

const ThemeContext = createContext({ theme: 'light' as Theme, toggle: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode; initial?: Theme }> = ({ children, initial = 'light' }) => {
  const [theme, setTheme] = useState<Theme>(initial);

  useEffect(() => {
    applyCssVariables();
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
