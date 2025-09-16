export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string;
  border: string;
  subtleBorder: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  primaryHover: string;
  primaryMuted: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  successSurface: string;
  warningSurface: string;
  dangerSurface: string;
  infoSurface: string;
  neutralSurface: string;
  overlay: string;
  navBackground: string;
  navText: string;
  sidebarBackground: string;
  sidebarHover: string;
  sidebarActive: string;
  sidebarText: string;
  sidebarActiveText: string;
}

export interface AppTheme {
  mode: ThemeMode;
  colors: ThemeColors;
  fonts: {
    body: string;
    heading: string;
    mono: string;
  };
  radii: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    focus: string;
  };
}

const common = {
  fonts: {
    body: '"Nunito", serif',
    heading: '"Nunito", serif',
    mono: '"IBM Plex Sans", sans-serif',
  },
  radii: {
    sm: '6px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  shadows: {
    focus: '0 0 0 3px rgba(37, 70, 240, 0.35)',
  },
} satisfies Pick<AppTheme, 'fonts' | 'radii' | 'spacing' | 'shadows'>;

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceAlt: '#F3F4F6',
  surfaceElevated: '#FFFFFF',
  border: '#E5E7EB',
  subtleBorder: '#E5E7EB',
  text: '#111827',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',
  primary: '#2546F0',
  primaryHover: '#1E40AF',
  primaryMuted: 'rgba(37, 70, 240, 0.1)',
  accent: '#4B5563',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  successSurface: 'rgba(16, 185, 129, 0.12)',
  warningSurface: 'rgba(245, 158, 11, 0.15)',
  dangerSurface: 'rgba(239, 68, 68, 0.16)',
  infoSurface: 'rgba(59, 130, 246, 0.12)',
  neutralSurface: 'rgba(107, 114, 128, 0.12)',
  overlay: 'rgba(15, 23, 42, 0.65)',
  navBackground: '#2546F0',
  navText: '#FFFFFF',
  sidebarBackground: '#FFFFFF',
  sidebarHover: '#F2F4FE',
  sidebarActive: '#F2F4FE',
  sidebarText: '#374151',
  sidebarActiveText: '#2546F0',
};

const darkColors: ThemeColors = {
  background: '#0B1120',
  surface: '#111827',
  surfaceAlt: '#1F2937',
  surfaceElevated: '#1F2937',
  border: '#1F2937',
  subtleBorder: '#374151',
  text: '#F9FAFB',
  textMuted: '#CBD5F5',
  textSubtle: '#93A3C1',
  primary: '#5C7CFF',
  primaryHover: '#7890FF',
  primaryMuted: 'rgba(92, 124, 255, 0.12)',
  accent: '#9CA3AF',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  info: '#60A5FA',
  successSurface: 'rgba(52, 211, 153, 0.2)',
  warningSurface: 'rgba(251, 191, 36, 0.22)',
  dangerSurface: 'rgba(248, 113, 113, 0.24)',
  infoSurface: 'rgba(96, 165, 250, 0.18)',
  neutralSurface: 'rgba(148, 163, 184, 0.18)',
  overlay: 'rgba(8, 13, 26, 0.7)',
  navBackground: '#111827',
  navText: '#F9FAFB',
  sidebarBackground: '#111827',
  sidebarHover: 'rgba(92, 124, 255, 0.12)',
  sidebarActive: 'rgba(92, 124, 255, 0.18)',
  sidebarText: '#E5E7EB',
  sidebarActiveText: '#FFFFFF',
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: lightColors,
  ...common,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: darkColors,
  ...common,
};
