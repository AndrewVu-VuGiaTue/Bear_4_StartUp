import React, { useMemo, useState } from 'react';
import { TextInput, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  autoCorrect?: boolean;
  textContentType?: any;
  secureToggle?: boolean; // show eye icon to toggle visibility
}

export default function ThemedTextInput(props: Props) {
  const { label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, autoCorrect, textContentType, secureToggle } = props;
  const [secure, setSecure] = useState<boolean>(!!secureTextEntry);
  const icon = useMemo(() => (secure ? 'eye-off' : 'eye'), [secure]);
  const effectiveTextContentType = useMemo(() => (secure ? textContentType : 'none'), [secure, textContentType]);
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: (colors as any).text }]}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          key={secure ? 'secure' : 'plain'}
          style={[styles.input, { backgroundColor: (colors as any).white, borderColor: (colors as any).border, color: (colors as any).text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={(colors as any).placeholder || '#9aa4ae'}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={secure ? !!autoCorrect : false}
          textContentType={effectiveTextContentType}
        />
        {secureToggle ? (
          <TouchableOpacity accessibilityRole="button" onPress={() => setSecure((s) => !s)} style={styles.eyeBtn}>
            <Ionicons name={icon as any} size={18} color={(colors as any).placeholder || '#9aa4ae'} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
  
const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { marginBottom: 6, fontWeight: '600' },
  inputWrapper: { position: 'relative' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingRight: 38,
  },
  eyeBtn: { position: 'absolute', right: 10, top: 0, bottom: 0, justifyContent: 'center' },
});
