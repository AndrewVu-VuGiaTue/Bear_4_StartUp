import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';
import { useTheme, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export default function ProfileScreen() {
  const { user, updateProfileLocal, token } = useAuth();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  
  // Modal states
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // Form states
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  
  const canSavePwd = newPassword.length >= 6 && newPassword === confirmPassword;
  const authHeader = (t?: string | null) => (t ? { Authorization: `Bearer ${t}` } : undefined);

  const onSaveDisplayName = async () => {
    try {
      await api.put('/auth/change-display-name', { displayName }, { headers: authHeader(token) });
      updateProfileLocal({ displayName });
      Alert.alert('Success', 'Display name updated');
      setShowDisplayNameModal(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to update display name';
      Alert.alert('Error', msg);
    }
  };

  const onChangePassword = async () => {
    if (!canSavePwd) {
      Alert.alert('Error', 'New password must be at least 6 characters and match confirmation.');
      return;
    }
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword }, { headers: authHeader(token) });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed');
      setShowPasswordModal(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to change password';
      Alert.alert('Error', msg);
    }
  };

  const onChangeAvatar = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to change your avatar.');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Crop to square and resize
        const manipResult = await manipulateAsync(
          imageUri,
          [{ resize: { width: 400, height: 400 } }],
          { compress: 0.8, format: SaveFormat.JPEG }
        );

        setAvatarUri(manipResult.uri);
        Alert.alert('Success', 'Avatar updated! (Note: Avatar storage not implemented yet, will reset on app restart)');
      }
    } catch (error) {
      console.error('Avatar picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
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
    cancelButton: { flex: 1, backgroundColor: (colors as any).border, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    cancelText: { color: (colors as any).text, fontWeight: '600' },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerTop}>
        <TouchableOpacity accessibilityRole="button" onPress={() => nav.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={(colors as any).text} />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
      </View>
      
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Avatar Header */}
        <View style={styles.header}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarCircle} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
          )}
          <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowDisplayNameModal(true)}>
            <View style={styles.menuIcon}>
              <Ionicons name="person-outline" size={18} color={(colors as any).primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Change Display Name</Text>
              <Text style={styles.menuSubtitle}>Update your profile name</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={(colors as any).placeholder} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setShowPasswordModal(true)}>
            <View style={styles.menuIcon}>
              <Ionicons name="lock-closed-outline" size={18} color={(colors as any).primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Change Password</Text>
              <Text style={styles.menuSubtitle}>Update your account password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={(colors as any).placeholder} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={onChangeAvatar}>
            <View style={styles.menuIcon}>
              <Ionicons name="camera-outline" size={18} color={(colors as any).primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Change Avatar</Text>
              <Text style={styles.menuSubtitle}>Upload a profile picture</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={(colors as any).placeholder} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Display Name Modal */}
      <Modal visible={showDisplayNameModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Display Name</Text>
            <ThemedTextInput 
              label="Display Name" 
              value={displayName} 
              onChangeText={setDisplayName} 
              placeholder="Enter your name" 
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowDisplayNameModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <PrimaryButton title="Save" onPress={onSaveDisplayName} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <ThemedTextInput 
              label="Current Password" 
              value={currentPassword} 
              onChangeText={setCurrentPassword} 
              placeholder="Current password" 
              secureTextEntry 
              secureToggle 
              autoCapitalize="none" 
            />
            <ThemedTextInput 
              label="New Password" 
              value={newPassword} 
              onChangeText={setNewPassword} 
              placeholder="At least 6 characters" 
              secureTextEntry 
              secureToggle 
              autoCapitalize="none" 
            />
            <ThemedTextInput 
              label="Confirm Password" 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              placeholder="Retype new password" 
              secureTextEntry 
              secureToggle 
              autoCapitalize="none" 
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPasswordModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <PrimaryButton title="Update" onPress={onChangePassword} disabled={!canSavePwd} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
