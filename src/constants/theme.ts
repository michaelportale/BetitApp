// Centralized theme constants for consistent styling across the app

// Base color palette
export const colors = {
  // Primary colors
  primary: '#0e7490',
  primaryLight: '#06b6d4',
  primaryDark: '#0f172a',

  // Background colors
  background: '#1c1c1e',
  backgroundSecondary: '#2c2c2e',
  backgroundTertiary: '#3a3a3c',

  // Text colors
  text: '#ffffff',
  textSecondary: '#8e8e93',
  textMuted: '#6d6d70',

  // State colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#8b5cf6',

  // Functional colors
  border: '#3a3a3c',
  divider: '#48484a',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Transparent colors
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
} as const;

// Typography system
export const typography = {
  fontFamily: {
    primary: 'SpaceMono-Regular', // Custom font loaded in app
    system: 'System', // iOS/Android system font fallback
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// Spacing system (based on 4px grid)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// Border radius system
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// Component-specific theme objects
export const components = {
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  button: {
    primary: {
      backgroundColor: colors.primary,
      color: colors.white,
      borderRadius: borderRadius.base,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    secondary: {
      backgroundColor: colors.backgroundTertiary,
      color: colors.text,
      borderRadius: borderRadius.base,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
  },
  text: {
    heading: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
    },
    subheading: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text,
    },
    body: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      color: colors.text,
    },
    caption: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      color: colors.textSecondary,
    },
  },
  input: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    color: colors.text,
    placeholderColor: colors.textSecondary,
  },
  fab: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    position: 'absolute' as const,
    right: spacing[5],
    bottom: spacing[5],
  },
} as const;

// Layout constants
export const layout = {
  headerHeight: 44,
  tabBarHeight: 83,
  statusBarHeight: 44, // iOS default, adjust for Android
  screenPadding: spacing[4],
  sectionSpacing: spacing[6],
} as const;

// Theme object for easy access
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  components,
  layout,
} as const;

export default theme;
