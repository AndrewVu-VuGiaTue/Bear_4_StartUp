import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type User = {
  id?: string;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl?: string | null;
};

export type AuthState = {
  user: User | null;
  token?: string | null;
  isLoading: boolean;
  setSession: (u: User, token?: string | null) => void;
  clear: (onClearCallback?: () => void) => void;
  updateProfileLocal: (patch: Partial<User>) => void;
};

const Ctx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lazy load AsyncStorage to avoid hard dependency
  let AsyncStorage: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch {}

  useEffect(() => {
    (async () => {
      try {
        if (!AsyncStorage) {
          console.log('[Auth] AsyncStorage not available');
          setIsLoading(false);
          return;
        }
        const raw = await AsyncStorage.getItem('bear.auth');
        if (raw) {
          const parsed = JSON.parse(raw);
          console.log('[Auth] Session loaded - User:', parsed.user?.username, 'Token:', parsed.token ? 'exists' : 'null');
          setUser(parsed.user || null);
          setToken(parsed.token || null);
        } else {
          console.log('[Auth] No saved session found');
        }
      } catch (err) {
        console.error('[Auth] Failed to load session:', err);
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthState>(() => {
    console.log('[Auth] Context value updated - User:', user?.username || 'null', 'Token:', token ? 'exists' : 'null', 'Loading:', isLoading);
    return {
    user,
    token,
    isLoading,
    setSession: (u: User, t?: string | null) => {
      console.log('[Auth] setSession called - User:', u.username, 'Token:', t ? 'exists' : 'null');
      setUser(u);
      setToken(t ?? null);
      try {
        AsyncStorage?.setItem('bear.auth', JSON.stringify({ user: u, token: t ?? null }));
        console.log('[Auth] Session saved to AsyncStorage');
      } catch (err) {
        console.error('[Auth] Failed to save session:', err);
      }
    },
    clear: (onClearCallback?: () => void) => {
      // Call callback first (e.g., disconnect Bluetooth)
      if (onClearCallback) {
        try {
          onClearCallback();
        } catch (err) {
          console.error('[Auth] Error in clear callback:', err);
        }
      }
      
      setUser(null);
      setToken(null);
      try { AsyncStorage?.removeItem('bear.auth'); } catch {}
    },
    updateProfileLocal: (patch: Partial<User>) => {
      setUser((prev) => {
        const next = prev ? { ...prev, ...patch } : prev;
        try { AsyncStorage?.setItem('bear.auth', JSON.stringify({ user: next, token })); } catch {}
        return next;
      });
    },
  };
  }, [user, token, isLoading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
