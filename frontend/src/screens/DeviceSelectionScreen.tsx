import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform, PermissionsAndroid } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealth } from '../context/HealthContext';

type BluetoothDevice = {
  id: string;
  name: string;
  address: string;
  bonded?: boolean;
};

export default function DeviceSelectionScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const health = useHealth();
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const requestBluetoothPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 31) {
        // Android 12+
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Android < 12
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error('[DeviceSelection] Permission error:', err);
      return false;
    }
  };

  const loadDevices = async () => {
    setLoading(true);
    try {
      if (Platform.OS !== 'android') {
        setLoading(false);
        return;
      }

      // Request permissions first
      const hasPermission = await requestBluetoothPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permissions Required',
          'Bluetooth and Location permissions are required to scan for devices. Please enable them in Settings.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      const RNBTC = require('react-native-bluetooth-classic');
      const RNBluetoothClassic = RNBTC.default || RNBTC;

      // Get bonded devices
      const bondedDevices = await RNBluetoothClassic.getBondedDevices();
      setDevices(bondedDevices.map((d: any) => ({
        id: d.id || d.address,
        name: d.name || 'Unknown Device',
        address: d.address,
        bonded: true,
      })));
    } catch (e) {
      console.error('[DeviceSelection] Failed to load devices:', e);
      Alert.alert('Error', 'Failed to load Bluetooth devices. Make sure Bluetooth is enabled.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceSelect = async (device: BluetoothDevice) => {
    // Validate device name
    if (!device.name.startsWith('ESP32_HealthBand')) {
      Alert.alert(
        'Invalid Device',
        'Please select your ESP32_HealthBand to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    setConnecting(true);
    try {
      const success = await health.connect({ address: device.address });
      if (success) {
        Alert.alert('Success', `Connected to ${device.name}`, [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Connection Failed', 'Could not connect to device. Please try again.');
      }
    } catch (e) {
      console.error('[DeviceSelection] Connection error:', e);
      Alert.alert('Error', 'Failed to connect to device');
    } finally {
      setConnecting(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background },
    content: { padding: 12, paddingBottom: 32 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: (colors as any).border,
    },
    backButton: { marginRight: 12 },
    headerTitle: { color: (colors as any).text, fontSize: 20, fontWeight: '700' },
    sectionTitle: {
      color: (colors as any).placeholder,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 12,
      paddingHorizontal: 16,
    },
    deviceCard: {
      backgroundColor: (colors as any).card,
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: (colors as any).border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    deviceIcon: { marginRight: 16 },
    deviceInfo: { flex: 1 },
    deviceName: { color: (colors as any).text, fontSize: 16, fontWeight: '600', marginBottom: 4 },
    deviceAddress: { color: (colors as any).placeholder, fontSize: 12 },
    chevron: { marginLeft: 8 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: (colors as any).text, marginTop: 12 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    emptyText: { color: (colors as any).placeholder, fontSize: 16, textAlign: 'center' },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={(colors as any).text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Device</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={(colors as any).primary} />
          <Text style={styles.loadingText}>Loading devices...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={(colors as any).text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Device</Text>
      </View>

      {devices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bluetooth-outline" size={64} color={(colors as any).placeholder} />
          <Text style={styles.emptyText}>
            No paired devices found.{'\n'}
            Please pair your ESP32_HealthBand in Bluetooth settings first.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Paired devices</Text>
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deviceCard}
                onPress={() => handleDeviceSelect(item)}
                disabled={connecting}
              >
                <View style={styles.deviceIcon}>
                  <Ionicons
                    name={item.name.includes('ESP32') ? 'watch-outline' : 'bluetooth'}
                    size={32}
                    color={(colors as any).primary}
                  />
                </View>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{item.name}</Text>
                  <Text style={styles.deviceAddress}>{item.address}</Text>
                </View>
                {connecting ? (
                  <ActivityIndicator size="small" color={(colors as any).primary} />
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={(colors as any).placeholder}
                    style={styles.chevron}
                  />
                )}
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}
