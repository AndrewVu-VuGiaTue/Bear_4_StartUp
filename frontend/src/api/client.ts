import axios from 'axios';
import Constants from 'expo-constants';

// Read from Expo config first (works reliably in Expo Go), then env, then fallback
const CONFIG_BASE: string | undefined =
  (Constants as any).expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
  (Constants as any).manifest2?.extra?.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_API_URL;

// For Android emulator, 10.0.2.2 reaches the host machine's localhost
const FALLBACK_BASE = 'http://10.0.2.2:4000';
const BASE_URL = CONFIG_BASE || FALLBACK_BASE;
if (!CONFIG_BASE) {
  // Help developers notice when using fallback (may fail on physical device)
  // On physical devices, set EXPO_PUBLIC_API_URL to your machine's LAN IP, e.g. http://192.168.x.x:4000
  // eslint-disable-next-line no-console
  console.warn('[API] Using fallback BASE_URL:', BASE_URL);
} else {
  // eslint-disable-next-line no-console
  console.info('[API] Using configured BASE_URL:', BASE_URL);
}
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Debug logging to help diagnose API issues in development
api.interceptors.request.use((config) => {
  // eslint-disable-next-line no-console
  console.info('[API] Request', config.method?.toUpperCase(), config.baseURL + (config.url || ''), config.data || '');
  return config;
});

api.interceptors.response.use(
  (res) => {
    // eslint-disable-next-line no-console
    console.info('[API] Response', res.status, res.config.url);
    return res;
  },
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.baseURL + (error?.config?.url || '');
    const data = error?.response?.data;
    // eslint-disable-next-line no-console
    console.error('[API] Error', status, url, data || error.message);
    return Promise.reject(error);
  }
);
