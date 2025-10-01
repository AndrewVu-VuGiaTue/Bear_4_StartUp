import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DefaultTheme, Theme } from '@react-navigation/native';
import { themeMap } from '../theme/colors';

// Minimal settings persisted locally
export type SettingsState = {
  notificationsEnabled: boolean;
  healthAlerts: boolean;
  appUpdates: boolean;
  appearance: string; // e.g., 'default', 'teal', 'peach', ...
  setNotificationsEnabled: (v: boolean) => void;
  setHealthAlerts: (v: boolean) => void;
  setAppUpdates: (v: boolean) => void;
  setAppearance: (k: string) => void;
};

const Ctx = createContext<SettingsState | undefined>(undefined);

function readStorage() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
  } catch {
    return null;
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const AsyncStorage = readStorage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [healthAlerts, setHealthAlerts] = useState(true);
  const [appUpdates, setAppUpdates] = useState(false);
  const [appearance, setAppearance] = useState('default');

  useEffect(() => {
    (async () => {
      try {
        if (!AsyncStorage) return;
        const raw = await AsyncStorage.getItem('bear.settings');
        if (raw) {
          const s = JSON.parse(raw);
          if (typeof s.notificationsEnabled === 'boolean') setNotificationsEnabled(s.notificationsEnabled);
          if (typeof s.healthAlerts === 'boolean') setHealthAlerts(s.healthAlerts);
          if (typeof s.appUpdates === 'boolean') setAppUpdates(s.appUpdates);
          if (typeof s.appearance === 'string') setAppearance(s.appearance);
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage?.setItem(
          'bear.settings',
          JSON.stringify({ notificationsEnabled, healthAlerts, appUpdates, appearance })
        );
      } catch {}
    })();
  }, [AsyncStorage, notificationsEnabled, healthAlerts, appUpdates, appearance]);

  const value = useMemo<SettingsState>(() => ({
    notificationsEnabled,
    healthAlerts,
    appUpdates,
    appearance,
    setNotificationsEnabled,
    setHealthAlerts,
    setAppUpdates,
    setAppearance,
  }), [notificationsEnabled, healthAlerts, appUpdates, appearance]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export function themeFromAppearance(appearance: string, fallback: Theme = DefaultTheme): Theme {
  return themeMap[appearance] || fallback;
}
