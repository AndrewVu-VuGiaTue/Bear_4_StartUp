import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import ThemedTextInput from '../components/ThemedTextInput';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';
import { useTheme, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EmergencyContactScreen() {
  const nav = useNavigation<any>();
  const { colors } = useTheme();
  const { user, updateProfileLocal, token } = useAuth();

  const [emergencyContactEmail, setEmergencyContactEmail] = useState(user?.emergencyContactEmail || '');
  const [isLoading, setIsLoading] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background, padding: 16 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    back: { marginRight: 8, padding: 6 },
    title: { color: (colors as any).text, fontWeight: '800', fontSize: 28 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 12, backgroundColor: (colors as any).card, borderRadius: 12, borderWidth: 1, borderColor: (colors as any).border, marginBottom: 10 },
    label: { color: (colors as any).text, fontSize: 16 },
    description: { color: (colors as any).placeholder, fontSize: 13, marginTop: 4 },
    inputRow: { paddingVertical: 14, paddingHorizontal: 12, backgroundColor: (colors as any).card, borderRadius: 12, borderWidth: 1, borderColor: (colors as any).border, marginBottom: 10 },
    inputLabel: { color: (colors as any).text, fontSize: 16, marginBottom: 8 },
    inputDescription: { color: (colors as any).placeholder, fontSize: 13, marginBottom: 12 },
  }), [colors]);

  const authHeader = (t?: string | null) => (t ? { Authorization: `Bearer ${t}` } : undefined);

  const onSaveEmergencyContact = async () => {
    if (!emergencyContactEmail.trim()) {
      Alert.alert('Error', 'Please enter an emergency contact email');
      return;
    }

    setIsLoading(true);
    try {
      await api.put('/auth/update-emergency-contact', { emergencyContactEmail: emergencyContactEmail || null }, { headers: authHeader(token) });
      updateProfileLocal({ emergencyContactEmail: emergencyContactEmail || null });
      Alert.alert('Success', 'Emergency contact updated');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to update emergency contact';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" onPress={() => nav.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={(colors as any).text} />
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Contact</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Emergency Contact Email</Text>
          <Text style={styles.inputDescription}>
            Enter the email address of a family member or trusted contact who should receive emergency alerts when critical health issues are detected
          </Text>
          <ThemedTextInput
            label="Emergency Contact Email"
            value={emergencyContactEmail}
            onChangeText={setEmergencyContactEmail}
            placeholder="family.member@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity style={[styles.row, { backgroundColor: (colors as any).primary }]} onPress={onSaveEmergencyContact} disabled={isLoading}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {isLoading ? 'Saving...' : 'Save Emergency Contact'}
          </Text>
        </TouchableOpacity>

        <View style={[styles.row, { backgroundColor: 'transparent', borderWidth: 0 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>How it works</Text>
            <Text style={styles.description}>
              • When critical health alerts are detected (severe fall, abnormal vital signs)
              {'\n'}• An emergency email will be sent to your designated contact
              {'\n'}• The email includes alert details and your current status
              {'\n'}• This helps ensure someone can check on you during emergencies
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
