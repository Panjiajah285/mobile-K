/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEF2FF',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    primary: '#FF5E1E',
    primaryDark: '#C2410C',
    primarySoft: '#FFF7ED',
    secondary: '#4F46E5',
    accent: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    card: '#FFFFFF',
    surface: '#F1F5F9',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0B0F19',
    backgroundElement: '#151E2E',
    backgroundSelected: '#1E293B',
    textSecondary: '#94A3B8',
    border: '#243047',
    primary: '#FF6B2B',
    primaryDark: '#EA580C',
    primarySoft: '#291811',
    secondary: '#6366F1',
    accent: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    card: '#151E2E',
    surface: '#1E293B',
  },
} as const;

export type ThemePresetKey = 'sunset' | 'indigo' | 'emerald' | 'berry';

export interface ThemePreset {
  id: ThemePresetKey;
  name: string;
  tagline: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  accent: string;
  gradient: [string, string];
  heroBg: string;
  icon: string;
}

export const THEME_PRESETS: Record<ThemePresetKey, ThemePreset> = {
  sunset: {
    id: 'sunset',
    name: 'Sunset Coral',
    tagline: 'Hangat, Enerjik & Lezat',
    primary: '#FF5E1E',
    primaryDark: '#C2410C',
    primarySoft: '#FFF7ED',
    accent: '#F59E0B',
    gradient: ['#FF5E1E', '#FF8A00'],
    heroBg: '#9A3412',
    icon: '🌅',
  },
  indigo: {
    id: 'indigo',
    name: 'Cyber Indigo',
    tagline: 'Modern, Futuristik & Sleek',
    primary: '#4F46E5',
    primaryDark: '#3730A3',
    primarySoft: '#EEF2FF',
    accent: '#06B6D4',
    gradient: ['#4F46E5', '#6366F1'],
    heroBg: '#312E81',
    icon: '⚡',
  },
  emerald: {
    id: 'emerald',
    name: 'Fresh Mint',
    tagline: 'Segar, Sehat & Organik',
    primary: '#059669',
    primaryDark: '#065F46',
    primarySoft: '#ECFDF5',
    accent: '#10B981',
    gradient: ['#059669', '#10B981'],
    heroBg: '#064E3B',
    icon: '🌿',
  },
  berry: {
    id: 'berry',
    name: 'Berry Velvet',
    tagline: 'Mewah, Elegan & Premium',
    primary: '#E11D48',
    primaryDark: '#9F1239',
    primarySoft: '#FFF1F2',
    accent: '#FB7185',
    gradient: ['#E11D48', '#F43F5E'],
    heroBg: '#881337',
    icon: '🍓',
  },
};


export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
