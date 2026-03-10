const tintColorLight = '#007AFF';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#1c1c1e',
    background: '#f0f0f7',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: '#fff',
    border: '#e0e0e0',
    primary: '#007AFF',
    secondary: '#FC6A03', // Orange for motorcycles
    gray: '#8e8e93',
    lightGray: '#e9e9eb',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
  },
  dark: {
    // For future dark mode implementation
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    card: '#1c1c1e',
    border: '#3a3a3c',
    primary: '#007AFF',
    secondary: '#FC6A03',
    gray: '#8e8e93',
    lightGray: '#3a3a3c',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
  },
};

export const FontSize = {
  title: 28,
  subtitle: 22,
  large: 17,
  medium: 16,
  small: 14,
  tiny: 12,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
};
