import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import PrimaryButton from '../components/PrimaryButton';

type EmergencyContact = {
  _id: string;
  name: string;
  email: string;
  addedAt: string;
};

export default function EmergencyContactScreen() {
  const nav = useNavigation<any>();
  const { colors } = useTheme();
  const { token } = useAuth();
  
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const authHeader = (t?: string | null) => (t ? { Authorization: `Bearer ${t}` } : undefined);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const res = await api.get('/auth/emergency-contacts', { headers: authHeader(token) });
      setContacts(res.data.emergencyContacts || []);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const addContact = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Please enter both name and email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        '/auth/emergency-contacts',
        { name: name.trim(), email: email.trim() },
        { headers: authHeader(token) }
      );
      setContacts(res.data.emergencyContacts || []);
      setName('');
      setEmail('');
      Alert.alert('Success', 'Emergency contact added successfully');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to add contact';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const removeContact = async (id: string) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.delete(`/auth/emergency-contacts/${id}`, {
                headers: authHeader(token),
              });
              setContacts(res.data.emergencyContacts || []);
              Alert.alert('Success', 'Contact removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove contact');
            }
          },
        },
      ]
    );
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: (colors as any).background },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 8,
          marginBottom: 16,
        },
        back: { marginRight: 8, padding: 6 },
        title: { color: (colors as any).text, fontWeight: '800', fontSize: 28 },
        content: { paddingHorizontal: 16, paddingBottom: 30 },
        
        infoBox: {
          backgroundColor: (colors as any).card,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: (colors as any).border,
          marginBottom: 20,
        },
        infoText: {
          color: (colors as any).placeholder,
          fontSize: 14,
          lineHeight: 20,
        },

        addSection: {
          backgroundColor: (colors as any).card,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: (colors as any).border,
          marginBottom: 20,
        },
        sectionTitle: {
          color: (colors as any).text,
          fontSize: 18,
          fontWeight: '700',
          marginBottom: 12,
        },
        input: {
          backgroundColor: (colors as any).background,
          borderWidth: 1,
          borderColor: (colors as any).border,
          borderRadius: 8,
          padding: 12,
          color: (colors as any).text,
          fontSize: 16,
          marginBottom: 12,
        },

        listSection: {
          backgroundColor: (colors as any).card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: (colors as any).border,
          overflow: 'hidden',
        },
        listHeader: {
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: (colors as any).border,
        },
        listTitle: {
          color: (colors as any).text,
          fontSize: 18,
          fontWeight: '700',
        },
        emptyText: {
          color: (colors as any).placeholder,
          fontSize: 14,
          textAlign: 'center',
          padding: 30,
        },

        contactItem: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: (colors as any).border,
        },
        contactItemLast: { borderBottomWidth: 0 },
        contactIcon: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: (colors as any).primary + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        },
        contactInfo: { flex: 1 },
        contactName: {
          color: (colors as any).text,
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 2,
        },
        contactEmail: {
          color: (colors as any).placeholder,
          fontSize: 14,
        },
        deleteBtn: { padding: 8 },
      }),
    [colors]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => nav.goBack()}
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={24} color={(colors as any).text} />
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Contact</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Add emergency contacts who will be notified via email when a{' '}
            <Text style={{ fontWeight: '700', color: (colors as any).primary }}>
              CRITICAL
            </Text>{' '}
            health alert is detected. You can add multiple contacts.
          </Text>
        </View>

        {/* Add Contact Form */}
        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Add New Contact</Text>
          <TextInput
            style={styles.input}
            placeholder="Contact Name"
            placeholderTextColor={(colors as any).placeholder}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor={(colors as any).placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PrimaryButton
            title={loading ? 'Adding...' : 'Add Contact'}
            onPress={addContact}
            disabled={loading}
          />
        </View>

        {/* Contact List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Emergency Contact List</Text>
          </View>
          {contacts.length === 0 ? (
            <Text style={styles.emptyText}>
              No emergency contacts added yet.{'\n'}
              Add contacts above to get started.
            </Text>
          ) : (
            contacts.map((contact, index) => (
              <View
                key={contact._id}
                style={[
                  styles.contactItem,
                  index === contacts.length - 1 && styles.contactItemLast,
                ]}
              >
                <View style={styles.contactIcon}>
                  <Ionicons name="person" size={20} color={(colors as any).primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactEmail}>{contact.email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeContact(contact._id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#e11d48" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
