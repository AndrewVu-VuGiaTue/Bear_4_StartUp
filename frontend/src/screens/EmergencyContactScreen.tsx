import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Modal } from 'react-native';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';
import { useTheme, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EmergencyContactScreen() {
  const { user, updateProfileLocal, token } = useAuth();
  const { colors } = useTheme();
  const nav = useNavigation<any>();

  // Modal states
  const [showEmergencyContactModal, setShowEmergencyContactModal] = useState(false);

  // Form states
  const [emergencyContactEmail, setEmergencyContactEmail] = useState(user?.emergencyContactEmail || '');

  const authHeader = (t?: string | null) => (t ? { Authorization: `Bearer ${t}` } : undefined);

  const onSaveEmergencyContact = async () => {
    try {
      await api.put('/auth/update-emergency-contact', { emergencyContactEmail: emergencyContactEmail || null }, { headers: authHeader(token) });
      updateProfileLocal({ emergencyContactEmail: emergencyContactEmail || null });
      Alert.alert('Success', 'Emergency contact updated');
      setShowEmergencyContactModal(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to update emergency contact';
      Alert.alert('Error', msg);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background },
    headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16, paddingTop: 8 },
    back: { marginRight: 8, padding: 6 },
    title: { color: (colors as any).text, fontWeight: '800', fontSize: 28 },
    header: { alignItems: 'center', paddingVertical: 24, backgroundColor: (colors as any).card, marginHorizontal: 16, borderRadius: 16, marginBottom: 16 },
    avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: (colors as any).primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    avatarText: { color: '#fff', fontSize: 40, fontWeight: '700' },
    userName: { color: (colors as any).text, fontSize: 20, fontWeight: '700', marginBottom: 4 },
    userEmail: { color: (colors as any).placeholder, fontSize: 14 },

    menuContainer: { marginHorizontal: 16, backgroundColor: (colors as any).card, borderRadius: 16, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: (colors as any).border },
    menuItemLast: { borderBottomWidth: 0 },
    menuIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: (colors as any).primary + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    menuContent: { flex: 1 },
    menuTitle: { color: (colors as any).text, fontSize: 16, fontWeight: '600' },
    menuSubtitle: { color: (colors as any).placeholder, fontSize: 13, marginTop: 2 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: (colors as any).card, borderRadius: 16, padding: 20, width: '85%', maxWidth: 400 },
    modalTitle: { color: (colors as any).text, fontSize: 20, fontWeight: '700', marginBottom: 16 },
    modalButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
    cancelButton: { flex: 1, backgroundColor: (colors as any).primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    cancelText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerTop}>
        <TouchableOpacity accessibilityRole="button" onPress={() => nav.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={(colors as any).text} />
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Contact</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Info Header */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Ionicons name="shield-checkmark" size={50} color="#fff" />
          </View>
          <Text style={styles.userName}>Emergency Contact</Text>
          <Text style={styles.userEmail}>
            Set up an emergency contact email to receive alerts when critical health issues are detected
          </Text>
        </View>

        {/* Current Emergency Contact */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowEmergencyContactModal(true)}>
            <View style={styles.menuIcon}>
              <Ionicons name="mail-outline" size={18} color={(colors as any).primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Emergency Contact Email</Text>
              <Text style={styles.menuSubtitle}>
                {user?.emergencyContactEmail || 'No emergency contact set'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={(colors as any).placeholder} />
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={[styles.menuContainer, { marginTop: 16 }]}>
          <View style={{ padding: 16 }}>
            <Text style={[styles.menuTitle, { marginBottom: 8 }]}>How it works</Text>
            <Text style={[styles.menuSubtitle, { lineHeight: 20 }]}>
              • When critical health alerts are detected (severe fall, abnormal vital signs)
              {'\n'}• An emergency email will be sent to your designated contact
              {'\n'}• The email includes alert details and your current status
              {'\n'}• This helps ensure someone can check on you during emergencies
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Emergency Contact Modal */}
      <Modal visible={showEmergencyContactModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Emergency Contact Email</Text>
            <Text style={{ color: (colors as any).placeholder, fontSize: 14, marginBottom: 16 }}>
              Enter the email address of a family member or trusted contact who should receive emergency alerts
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
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEmergencyContactModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <PrimaryButton title="Save" onPress={onSaveEmergencyContact} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
