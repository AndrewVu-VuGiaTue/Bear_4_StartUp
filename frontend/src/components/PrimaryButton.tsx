import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

interface Props {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export default function PrimaryButton({ title, onPress, style, disabled }: Props) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, { backgroundColor: (colors as any).primary }, disabled && { opacity: 0.6 }, style]}
    >
      <Text style={[styles.text, { color: (colors as any).white || '#fff' }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    fontSize: 16,
  },
});
