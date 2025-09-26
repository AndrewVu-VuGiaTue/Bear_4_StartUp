import axios from 'axios';

// Prefer Expo public env. Set EXPO_PUBLIC_API_URL in app.json -> expo.extra or your env.
const ENV_BASE = process.env.EXPO_PUBLIC_API_URL;
// For Android emulator, 10.0.2.2 reaches the host machine's localhost
const FALLBACK_BASE = 'http://10.0.2.2:4000';
const BASE_URL = ENV_BASE || FALLBACK_BASE;

if (!ENV_BASE) {
  // Help developers notice when using fallback (may fail on physical device)
  // On physical devices, set EXPO_PUBLIC_API_URL to your machine's LAN IP, e.g. http://192.168.x.x:4000
  // eslint-disable-next-line no-console
  console.warn('[API] Using fallback BASE_URL:', BASE_URL);
}

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});
