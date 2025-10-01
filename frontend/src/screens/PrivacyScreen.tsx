import React, { useMemo } from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const POLICY = `HealthWatch Privacy Policy

Effective Date: 27/09/2025

HealthWatch (“we,” “our,” or “us”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.

1. Information We Collect
- Account Information: Email address, username, and password (hashed).
- Health Data: Heart rate, activity data, or other wellness metrics you choose to track.
- Device Information: Bluetooth-connected devices, app version, and device type.
- Usage Data: Interactions with the app, crash reports, and performance logs.
We do not collect sensitive data without your consent.

2. How We Use Your Information
- To provide and improve app features (e.g., health monitoring, reminders).
- To enable secure login and account management.
- To analyze usage patterns and fix technical issues.
- To send notifications (if you allow it).
We do not sell or rent your personal information to third parties.

3. Sharing of Information
We may share limited data only with:
- Service providers that help us operate the app (e.g., backend hosting).
- Legal authorities if required by law.
We will never share your health data for advertising or marketing purposes.

4. Data Security
We implement industry-standard security practices, including encryption and secure servers, to protect your data. However, no system is 100% secure, and we cannot guarantee absolute protection.

5. Your Rights
Depending on your location, you may have the right to:
- Access the personal data we hold about you.
- Request corrections or deletion.
- Withdraw consent for data processing.
To exercise these rights, please contact us at buddyforemergencyaandr@gmail.com.

6. Children’s Privacy
Our app is not intended for children under 13 (or the minimum legal age in your country). We do not knowingly collect data from children.

7. Changes to This Policy
We may update this Privacy Policy from time to time. Updates will be posted in the app, and continued use of the app means you accept the changes.

8. Contact Us
If you have questions about this Privacy Policy, contact us at: buddyforemergencyaandr@gmail.com
`;

export default function PrivacyScreen() {
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
    back: { marginRight: 8, padding: 6 },
    title: { color: (colors as any).text, fontWeight: '800', fontSize: 28 },
    content: { paddingHorizontal: 16, paddingBottom: 24 },
    text: { color: (colors as any).text, lineHeight: 20 },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" onPress={() => nav.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={(colors as any).text} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>{POLICY}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
