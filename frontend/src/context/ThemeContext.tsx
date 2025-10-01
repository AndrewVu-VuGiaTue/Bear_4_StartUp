import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSettings, themeFromAppearance } from './SettingsContext';
import { DefaultTheme } from '@react-navigation/native';

export type ThemeCtx = {
  themeColor: string; // primary color in use
  setThemeColor: (hex: string) => void;
  setThemeByAppearance: (appearanceKey: string) => void;
};

const Ctx = createContext<ThemeCtx | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { appearance, setAppearance } = useSettings();
  const [themeColor, setThemeColor] = useState<string>('#B31B1B');

  // Keep themeColor in sync with current appearance using the same base as App.tsx
  useEffect(() => {
    const base = {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: '#ffffff',
        primary: '#B31B1B',
        card: '#ffffff',
        text: '#222222',
        border: '#4E3629',
        notification: '#B31B1B',
      },
    };
    const themed = themeFromAppearance(appearance, base);
    setThemeColor(themed.colors.primary as string);
  }, [appearance]);

  const value = useMemo<ThemeCtx>(() => ({
    themeColor,
    setThemeColor,
    setThemeByAppearance: (key: string) => {
      setAppearance(key);
      // themeColor will sync via effect
    },
  }), [themeColor, setAppearance]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
