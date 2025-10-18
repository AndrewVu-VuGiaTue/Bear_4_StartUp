import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { api, authHeader } from '../api/client';
import { useAuth } from './AuthContext';

export type HealthSample = { ts: number; hr?: number; spo2?: number; steps?: number; battery?: number; totalG?: number };
export type WarningItem = { id: string; time: Date; severity: 'warning' | 'critical'; fall?: boolean; hrAbnormal?: number; spo2Abnormal?: number };

export type HealthState = {
  connected: boolean;
  deviceName?: string | null;
  battery?: number | null;
  latest?: HealthSample;
  history: HealthSample[]; // recent window for charts
  warnings: WarningItem[];
  connect: (opts?: { address?: string; namePrefix?: string }) => Promise<boolean>;
  disconnect: () => Promise<void>;
  removeWarning: (id: string) => void;
};

const Ctx = createContext<HealthState | undefined>(undefined);

// Lightweight BT wrapper loaded dynamically so web/dev without native module won't crash
async function loadBT() {
  if (Platform.OS !== 'android') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RNBTC = require('react-native-bluetooth-classic');
    return RNBTC;
  } catch {
    return null;
  }
}

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [connected, setConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [latest, setLatest] = useState<HealthSample | undefined>();
  const [history, setHistory] = useState<HealthSample[]>([]);
  const [warnings, setWarnings] = useState<WarningItem[]>([]);
  const btRef = useRef<any>(null);
  const subRef = useRef<any>(null);
  const lastWarningTimeRef = useRef<{ [key: string]: number }>({});
  const lastAlertSentRef = useRef<{ [key: string]: number }>({});
  const [lastResetDate, setLastResetDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  });

  // Daily reset: clear history and warnings at midnight
  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const now = new Date();
      const currentDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      if (currentDate !== lastResetDate) {
        // New day detected - reset all data
        setHistory([]);
        setWarnings([]);
        setLatest(undefined);
        setLastResetDate(currentDate);
      }
    }, 60 * 1000); // Check every minute
    return () => clearInterval(checkMidnight);
  }, [lastResetDate]);

  useEffect(() => {
    return () => {
      if (subRef.current) {
        try { subRef.current.remove(); } catch {}
      }
      if (btRef.current && btRef.current.isConnected) {
        try { btRef.current.disconnect(); } catch {}
      }
    };
  }, []);

  // Send critical alert email to emergency contacts
  const sendCriticalAlert = async (warning: WarningItem, sample: HealthSample) => {
    // Get fresh token from auth context
    const currentToken = auth.token;
    console.log('[HEALTH] sendCriticalAlert called, token:', currentToken ? 'exists' : 'null');
    console.log('[HEALTH] User:', auth.user ? auth.user.username : 'null');
    
    if (!currentToken) {
      console.log('[HEALTH] No token, skipping alert email');
      return;
    }

    // Check if we already sent alert for this type recently (prevent spam)
    const alertKey = `${warning.severity}-${warning.fall ? 'fall' : ''}${warning.hrAbnormal ? 'hr' : ''}${warning.spo2Abnormal ? 'spo2' : ''}`;
    const now = Date.now();
    const lastSent = lastAlertSentRef.current[alertKey] || 0;
    
    // Only send critical alerts once every 5 minutes
    if (now - lastSent < 5 * 60 * 1000) {
      console.log('[HEALTH] Alert email already sent recently, skipping');
      return;
    }

    try {
      let alertType = 'Critical Health Alert';
      let message = 'A critical health condition has been detected.';

      if (warning.fall) {
        alertType = 'Fall Detected';
        message = 'A fall has been detected. Please check on the user immediately.';
      } else if (warning.hrAbnormal && warning.spo2Abnormal) {
        alertType = 'Critical: Heart Rate & SpO2 Abnormal';
        message = 'Both heart rate and blood oxygen levels are abnormal.';
      } else if (warning.hrAbnormal) {
        alertType = 'Critical: Abnormal Heart Rate';
        message = `Heart rate is ${warning.hrAbnormal < 50 ? 'too low' : 'too high'}.`;
      } else if (warning.spo2Abnormal) {
        alertType = 'Critical: Low Blood Oxygen';
        message = 'Blood oxygen level is critically low.';
      }

      console.log('[HEALTH] Sending alert to API:', { alertType, heartRate: sample.hr, spo2: sample.spo2 });
      
      const response = await api.post('/health/alert', {
        alertType,
        message,
        heartRate: sample.hr,
        spo2: sample.spo2,
        temperature: null // Add if available
      }, {
        headers: authHeader(currentToken)
      });

      lastAlertSentRef.current[alertKey] = now;
      console.log('[HEALTH] Critical alert email sent successfully:', response.data);
    } catch (err: any) {
      console.error('[HEALTH] Failed to send alert email:', err?.response?.data || err?.message || err);
    }
  };

  const connect = async (opts?: { address?: string; namePrefix?: string }) => {
    const bt = await loadBT();
    if (!bt) {
      console.warn('[BT] Bluetooth module not available');
      return false;
    }

    try {
      // Get default adapter for Bluetooth Classic
      const RNBluetoothClassic = bt.default || bt;
      console.log('[BT] Bluetooth Classic module loaded');
      
      // Check runtime permissions (Android 12+)
      if (Platform.OS === 'android') {
        try {
          const { PermissionsAndroid } = require('react-native');
          const permissions = [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ];
          const granted = await PermissionsAndroid.requestMultiple(permissions);
          console.log('[BT] Permissions:', granted);
          
          const allGranted = Object.values(granted).every(
            (status) => status === PermissionsAndroid.RESULTS.GRANTED
          );
          if (!allGranted) {
            console.warn('[BT] Some Bluetooth permissions not granted');
          }
        } catch (e) {
          console.warn('[BT] Permission check failed:', e);
        }
      }
      
      // Check if Bluetooth is enabled
      try {
        const enabled = await RNBluetoothClassic.isBluetoothEnabled();
        console.log('[BT] Bluetooth enabled:', enabled);
        if (!enabled) {
          console.log('[BT] Requesting Bluetooth enable...');
          await RNBluetoothClassic.requestBluetoothEnabled();
        }
      } catch (e) {
        console.warn('[BT] Bluetooth enable check failed:', e);
      }

      // Get bonded/paired devices
      let devices: any[] = [];
      try {
        devices = await RNBluetoothClassic.getBondedDevices();
        console.log('[BT] Bonded devices count:', devices.length);
        devices.forEach((d: any, idx: number) => {
          console.log(`[BT] Device ${idx}:`, {
            name: d.name,
            id: d.id,
            address: d.address,
          });
        });
      } catch (e) {
        console.warn('[BT] getBondedDevices failed:', e);
        // If getBondedDevices fails, try to discover devices
        try {
          devices = await RNBluetoothClassic.list();
          console.log('[BT] Listed devices count:', devices.length);
        } catch (e2) {
          console.error('[BT] list() also failed:', e2);
          return false;
        }
      }

      // Find target device
      let device: any | null = null;
      if (opts?.address) {
        device = devices.find((d: any) => d.address === opts.address) || null;
        console.log('[BT] Found device by address:', device?.name);
      } else if (opts?.namePrefix) {
        device = devices.find((d: any) => String(d.name || '').startsWith(opts.namePrefix!)) || null;
        console.log('[BT] Found device by name prefix:', device?.name);
      }
      if (!device && devices.length) {
        device = devices[0];
        console.log('[BT] Using first available device:', device?.name);
      }
      if (!device) {
        console.error('[BT] No suitable device found');
        return false;
      }

      // Connect to device - use address or id
      const targetId = device.address ?? device.id;
      console.log('[BT] Connecting to device:', device.name, 'ID:', targetId);
      
      const connectedDevice = await RNBluetoothClassic.connectToDevice(targetId);
      console.log('[BT] Connection result:', connectedDevice);
      
      if (!connectedDevice) {
        console.error('[BT] Connection failed for device:', device.name);
        return false;
      }
      
      btRef.current = connectedDevice;
      setConnected(true);
      setDeviceName(device.name || device.address || device.id);
      console.log('[BT] Successfully connected to:', device.name);

      // Listen for data from ESP32
      const onData = (data: any) => {
        try {
          const text: string = data?.data || data || '';
          if (!text) return;
          
          const parsed = parseLine(text);
          if (!parsed) return;
          
          const sample: HealthSample = { ts: Date.now(), ...parsed };
          setLatest(sample);
          if (typeof sample.battery === 'number') {
            setBattery(sample.battery);
          }
          setHistory((h) => {
            const next = [...h, sample];
            // keep last 24h at ~1/min resolution (cap to 1500 samples)
            return next.slice(-1500);
          });
          // Warning rules with repeat intervals
          const w: WarningItem | null = makeWarnings(sample);
          if (w) {
            // Check if we should add this warning based on repeat interval
            const warningKey = `${w.severity}-${w.fall ? 'fall' : ''}${w.hrAbnormal ? 'hr' : ''}${w.spo2Abnormal ? 'spo2' : ''}`;
            const now = Date.now();
            const lastTime = lastWarningTimeRef.current[warningKey] || 0;
            
            // Critical: 1 minute interval, Warning: 5 minutes interval
            const interval = w.severity === 'critical' ? 60 * 1000 : 5 * 60 * 1000;
            
            if (now - lastTime >= interval) {
              setWarnings((prev) => [...prev, w]);
              lastWarningTimeRef.current[warningKey] = now;
              
              // Send email alert for critical warnings
              if (w.severity === 'critical') {
                sendCriticalAlert(w, sample);
              }
            }
          }
        } catch (e) {
          console.warn('[BT] onData error:', e);
        }
      };

      // Subscribe to device read events - use the connected device instance
      try {
        // Try to subscribe to read events
        if (connectedDevice.onDataReceived) {
          subRef.current = connectedDevice.onDataReceived((event: any) => {
            console.log('[BT] Data received:', event);
            onData(event);
          });
          console.log('[BT] Subscribed to onDataReceived');
        } else {
          // Fallback: read manually in a loop
          console.log('[BT] Using manual read fallback');
          const readInterval = setInterval(async () => {
            try {
              if (connectedDevice.isConnected && connectedDevice.isConnected()) {
                const available = await connectedDevice.available();
                if (available > 0) {
                  const data = await connectedDevice.read();
                  if (data) {
                    console.log('[BT] Manual read data:', data);
                    onData(data);
                  }
                }
              }
            } catch (e) {
              console.warn('[BT] Manual read error:', e);
            }
          }, 1000);
          subRef.current = { remove: () => clearInterval(readInterval) };
        }
      } catch (e) {
        console.error('[BT] Failed to setup data listener:', e);
      }

      return true;
    } catch (e) {
      console.warn('[BT] connect error', e);
      return false;
    }
  };

  const disconnect = async () => {
    const bt = btRef.current;
    if (!bt) {
      // Even if no device, clear all state
      setConnected(false);
      setDeviceName(null);
      setBattery(null);
      return;
    }
    try {
      if (subRef.current) { 
        try { 
          subRef.current.remove(); 
        } catch {} 
        subRef.current = null;
      }
      await bt.disconnect();
      btRef.current = null;
      setConnected(false);
      setDeviceName(null);
      setBattery(null);
      console.log('[BT] Disconnected and cleared state');
    } catch (e) {
      console.warn('[BT] disconnect error', e);
      // Still clear state even if disconnect fails
      setConnected(false);
      setDeviceName(null);
      setBattery(null);
    }
  };

  const removeWarning = (id: string) => {
    setWarnings((prev) => prev.filter((w) => w.id !== id));
  };

  const value = useMemo<HealthState>(() => ({
    connected,
    deviceName,
    battery,
    latest,
    history,
    warnings,
    connect,
    disconnect,
    removeWarning,
  }), [connected, deviceName, battery, latest, history, warnings]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHealth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useHealth must be used within HealthProvider');
  return ctx;
}

// ===== Helpers =====
function parseLine(s: string): Partial<HealthSample> | null {
  const str = s.trim();
  if (!str) return null;
  // ESP32 firmware format example:
  // ts: 10000 | x: 0.01 | y: 0.02 | z: 0.98 | G: 1.02 | Steps: 12 | BPM: 75.0 | SpO2: 97.0% | Battery: 81%
  const tsMatch = /\bts:\s*(\d+)/i.exec(str);
  const hrMatch = /\bBPM:\s*([\d\.]+)/i.exec(str);
  const spo2Match = /\bSpO2:\s*([\d\.]+)\s*%?/i.exec(str);
  const stepsMatch = /\bSteps:\s*(\d+)/i.exec(str);
  const battMatch = /\bBattery:\s*(\d+)\s*%/i.exec(str);
  const gMatch = /\bG:\s*([\d\.]+)/i.exec(str);
  if (hrMatch || spo2Match || stepsMatch || battMatch || gMatch) {
    const out: Partial<HealthSample> = {};
    // Use firmware timestamp if available, otherwise use current time
    if (tsMatch) {
      // Firmware sends milliseconds since boot, convert to actual timestamp
      // We'll use Date.now() as base and adjust
      out.ts = Date.now();
    }
    if (hrMatch) out.hr = Number(hrMatch[1]);
    if (spo2Match) out.spo2 = Number(spo2Match[1]);
    if (stepsMatch) out.steps = Number(stepsMatch[1]);
    if (battMatch) out.battery = Number(battMatch[1]);
    if (gMatch) out.totalG = Number(gMatch[1]);
    return out;
  }
  return null;
}

function makeWarnings(sample: HealthSample): WarningItem | null {
  let severity: 'warning' | 'critical' = 'warning';
  let flagged = false;
  const out: Partial<WarningItem> = { 
    id: `${sample.ts}`, 
    time: new Date(sample.ts)
  };
  
  // Fall detection: totalG > 15 → critical
  if (typeof sample.totalG === 'number' && sample.totalG > 15) {
    out.fall = true;
    severity = 'critical';
    flagged = true;
  }
  
  // Heart rate rules:
  // < 40 or > 150 → critical
  // < 50 or > 120 → warning
  if (typeof sample.hr === 'number') {
    if (sample.hr < 40 || sample.hr > 150) {
      out.hrAbnormal = sample.hr;
      severity = 'critical';
      flagged = true;
    } else if (sample.hr < 50 || sample.hr > 120) {
      out.hrAbnormal = sample.hr;
      if (severity !== 'critical') severity = 'warning';
      flagged = true;
    }
  }
  
  // SpO2 rules:
  // < 88 → critical
  // < 92 → warning
  if (typeof sample.spo2 === 'number') {
    if (sample.spo2 < 88) {
      out.spo2Abnormal = sample.spo2;
      severity = 'critical';
      flagged = true;
    } else if (sample.spo2 < 92) {
      out.spo2Abnormal = sample.spo2;
      if (severity !== 'critical') severity = 'warning';
      flagged = true;
    }
  }
  
  // SpO2 low + HR abnormal at the same time → critical
  if (typeof sample.spo2 === 'number' && sample.spo2 < 92 && 
      typeof sample.hr === 'number' && (sample.hr < 50 || sample.hr > 120)) {
    severity = 'critical';
  }
  
  if (!flagged) return null;
  
  return { ...out, severity } as WarningItem;
}
