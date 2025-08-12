import React, { createContext, useContext, ReactNode, useState } from 'react';
import { Colors, ThemeColors } from '../utils/colors';

interface ThemeContextProps {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme?: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  colors: Colors.light,
  isDark: false,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState(false);
  const colors = isDark ? Colors.dark : Colors.light;

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeToggle  = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useTheme = (): ThemeContextProps => useContext(ThemeContext);
