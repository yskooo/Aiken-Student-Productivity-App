import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';

export function Icon({ name, size = 20, color = theme.ink }: { name: React.ComponentProps<typeof Feather>['name']; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} />;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PillButton({ label, icon, onPress, active = false, style }: { label: string; icon?: React.ComponentProps<typeof Feather>['name']; onPress: () => void; active?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => { Haptics.selectionAsync(); onPress(); }} style={({ pressed }) => [styles.pill, active && styles.pillActive, pressed && styles.pressed, style]}>
      {icon && <Icon name={icon} size={15} color={active ? theme.ink : theme.mutedInk} />}
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton({ label, onPress, icon, disabled = false, style }: { label: string; onPress: () => void; icon?: React.ComponentProps<typeof Feather>['name']; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }} style={({ pressed }) => [styles.primaryButton, disabled && styles.disabled, pressed && styles.pressed, style]}>
      {icon && <Icon name={icon} size={17} color={theme.ink} />}
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function SectionTitle({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return <View style={styles.sectionHeader}>
    <View>{eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}<Text style={styles.sectionTitle}>{title}</Text></View>
    {action && onAction && <Pressable onPress={onAction}><Text style={styles.link}>{action}</Text></Pressable>}
  </View>;
}

export function Field({ value, onChangeText, placeholder, multiline = false }: { value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean }) {
  return <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={theme.mutedInk} multiline={multiline} style={[styles.input, multiline && styles.multiline]} />;
}

export function Loading() {
  return <View style={styles.loading}><ActivityIndicator color={theme.maroon} /></View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.card, padding: 16, shadowColor: theme.shadow.color, shadowOpacity: theme.shadow.opacity, shadowRadius: theme.shadow.radius, shadowOffset: { width: 0, height: 5 }, elevation: theme.shadow.elevation },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  pill: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, borderRadius: theme.radius.pill, backgroundColor: theme.colors.muted },
  pillActive: { backgroundColor: theme.amber },
  pillText: { color: theme.mutedInk, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  pillTextActive: { color: theme.ink },
  primaryButton: { minHeight: 48, paddingHorizontal: 18, borderRadius: theme.radius.control, backgroundColor: theme.amber, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  primaryText: { color: theme.ink, fontFamily: 'Inter_700Bold', fontSize: 14 },
  disabled: { opacity: 0.45 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 },
  eyebrow: { color: theme.maroon, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 },
  sectionTitle: { color: theme.ink, fontFamily: 'Inter_700Bold', fontSize: 23 },
  link: { color: theme.maroon, fontFamily: 'Inter_700Bold', fontSize: 13 },
  input: { minHeight: 48, borderRadius: theme.radius.control, borderWidth: 1, borderColor: theme.colors.input, paddingHorizontal: 14, color: theme.ink, backgroundColor: theme.cream, fontFamily: 'Inter_400Regular', fontSize: 14 },
  multiline: { minHeight: 90, paddingTop: 14, textAlignVertical: 'top' as TextStyle['textAlignVertical'] },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.cream },
});

export const uiStyles = styles;