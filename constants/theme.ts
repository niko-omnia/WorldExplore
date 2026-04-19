import '@/app/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    textSecondary: '#60646C',

    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',

    border: '#D0D3D8',

    button: '#333333',
    buttonPress: '#000000',

    progressDot: '#000000',
    progressBG: '#444444',
    progress: '#000000',

    tint: '#007AFF',
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#B0B4BA',

    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',

    border: '#3A3D42',

    button: '#ffffff',
    buttonPress: '#cccccc',

    progressDot: '#ffffff',
    progressBG: '#cccccc',
    progress: '#ffffff',

    tint: '#0A84FF',
  },
} as const;

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
