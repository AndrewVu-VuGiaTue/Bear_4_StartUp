import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

export type HealthSample = { ts: number; hr?: number; spo2?: number; steps?: number; battery?: number; totalG?: number };
export type WarningItem = { id: string; time: Date; fall?: boolean; hrAbnormal?: number; spo2Abnormal?: number };

export type HealthState = {
  connected: boolean;
  deviceName?: string | null;
  battery?: number | null;
  latest?: HealthSample;
  history: HealthSample[]; // recent window for charts
  warnings: WarningItem[];
  connect: (opts?: { address?: string; namePrefix?: string }) => Promise<boolean>;
  disconnect: () => Promise<void>;
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
  const [connected, setConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [latest, setLatest] = useState<HealthSample | undefined>();
  const [history, setHistory] = useState<HealthSample[]>([]);
  const [warnings, setWarnings] = useState<WarningItem[]>([]);
  const btRef = useRef<any>(null);
  const subRef = useRef<any>(null);

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

  const connect = async (opts?: { address?: string; namePrefix?: string }) => {
    const bt = await loadBT();
    if (!bt) return false;

    try {
      // Ensure BT enabled
      const enabled = await bt.isBluetoothEnabled();
      if (!enabled) {
        await bt.requestBluetoothEnabled();
      }

      // Find target device
      let device: any | null = null;
      const bonded = await bt.getBondedDevices();
      if (opts?.address) {
        device = bonded.find((d: any) => d.address === opts.address) || null;
      } else if (opts?.namePrefix) {
        device = bonded.find((d: any) => String(d.name || '').startsWith(opts.namePrefix!)) || null;
      }
      if (!device && bonded.length) device = bonded[0];
      if (!device) return false;

      const conn = await bt.connectToDevice(device.address);
      if (!conn) return false;
      btRef.current = bt;
      setConnected(true);
      setDeviceName(device.name || device.address);

      // Listen for data lines from the ESP32
      // Expected line format (examples):
      // HR:78,SpO2:97,Steps:20  OR CSV 78,97,20
      // Depending on library version, the event may be onDataReceived or onDeviceRead
      const onData = (event: any) => {
        const text: string = event.data || '';
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
        // simple warning rules
        const w: WarningItem | null = makeWarnings(sample);
        if (w) setWarnings((prev) => [...prev, w]);
      };

      subRef.current = (bt.onDeviceRead || bt.onDataReceived)?.(onData);

      return true;
    } catch (e) {
      console.warn('[BT] connect error', e);
      return false;
    }
  };

  const disconnect = async () => {
    const bt = btRef.current;
    if (!bt) return;
    try {
      if (subRef.current) { try { subRef.current.remove(); } catch {} }
      await bt.disconnect();
      setConnected(false);
    } catch (e) {
      console.warn('[BT] disconnect error', e);
    }
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
  }), [connected, deviceName, battery, latest, history, warnings]);

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
  // x: 0.01 | y: 0.02 | z: 0.98 | G: 1.02 | Steps: 12 | BPM: 75.0 | SpO2: 97.0% | Battery: 81%
  const hrMatch = /\bBPM:\s*([\d\.]+)/i.exec(str);
  const spo2Match = /\bSpO2:\s*([\d\.]+)\s*%?/i.exec(str);
  const stepsMatch = /\bSteps:\s*(\d+)/i.exec(str);
  const battMatch = /\bBattery:\s*(\d+)\s*%/i.exec(str);
  const gMatch = /\bG:\s*([\d\.]+)/i.exec(str);
  if (hrMatch || spo2Match || stepsMatch || battMatch || gMatch) {
    const out: Partial<HealthSample> = {};
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
  const out: WarningItem = { id: `${sample.ts}`, time: new Date(sample.ts) } as any;
  let flagged = false;
  if (typeof sample.hr === 'number' && (sample.hr < 50 || sample.hr > 120)) {
    out.hrAbnormal = sample.hr;
    flagged = true;
  }
  if (typeof sample.spo2 === 'number' && sample.spo2 < 92) {
    out.spo2Abnormal = sample.spo2;
    flagged = true;
  }
  // Fall detection: if totalG spikes dramatically, could flag; depends on device payload.
  return flagged ? out : null;
}
