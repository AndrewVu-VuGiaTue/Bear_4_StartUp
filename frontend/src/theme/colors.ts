import { DefaultTheme } from '@react-navigation/native';

export const colors = {
  background: '#ffffff',
  primary: '#B31B1B',
  secondary: '#4E3629',
  card: '#ffffff',
  border: '#4E3629',
  text: '#222222',
  placeholder: '#9aa4ae',
  white: '#ffffff',
};

// Centralized theme map for the whole app
export const themeMap: Record<string, any> = {
  // Base brand default (red/white/brown)
  default: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#B31B1B',
      background: '#ffffff',
      card: '#ffffff',
      text: '#222222',
      border: '#4E3629',
      notification: '#B31B1B',
      // non-navigation extras co-located for convenience
      placeholder: '#9aa4ae' as any,
      white: '#ffffff' as any,
    },
  },
  softpink: {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: '#ff7aa2', background: '#FFE6EC', card: '#ffffff', text: '#222222', border: '#ff7aa2', notification: '#ff7aa2', placeholder: '#9aa4ae' as any, white: '#ffffff' as any },
  },
  teal: {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: '#008080', background: '#E6F9F9', card: '#ffffff', text: '#222222', border: '#005f5f', notification: '#008080', placeholder: '#9aa4ae' as any, white: '#ffffff' as any },
  },
  turquoise: {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: '#40E0D0', background: '#E8FFFA', card: '#ffffff', text: '#222222', border: '#1fb8a9', notification: '#40E0D0', placeholder: '#9aa4ae' as any, white: '#ffffff' as any },
  },
  matcha: {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: '#A8C686', background: '#F1F7E9', card: '#ffffff', text: '#222222', border: '#86a266', notification: '#A8C686', placeholder: '#9aa4ae' as any, white: '#ffffff' as any },
  },
  sunshine: {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: '#FFD54F', background: '#FFF6D5', card: '#ffffff', text: '#222222', border: '#e6b93a', notification: '#FFD54F', placeholder: '#9aa4ae' as any, white: '#ffffff' as any },
  },
  peach: {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: '#FFB07C', background: '#FFE5D6', card: '#ffffff', text: '#222222', border: '#e69562', notification: '#FFB07C', placeholder: '#9aa4ae' as any, white: '#ffffff' as any },
  },
  lilac: {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: '#C8A2C8', background: '#F4EAF4', card: '#ffffff', text: '#222222', border: '#a784a7', notification: '#C8A2C8', placeholder: '#9aa4ae' as any, white: '#ffffff' as any },
  },
  pearl: {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: '#F8F6F0', background: '#FCFBF7', card: '#ffffff', text: '#222222', border: '#e5e2d9', notification: '#F8F6F0', placeholder: '#9aa4ae' as any, white: '#ffffff' as any },
  },
  pebble: {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: '#A9A9A9', background: '#F0F0F0', card: '#ffffff', text: '#222222', border: '#8f8f8f', notification: '#A9A9A9', placeholder: '#9aa4ae' as any, white: '#ffffff' as any },
  },
  darkorange: {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: '#FF8C00', background: '#FFEAD6', card: '#ffffff', text: '#222222', border: '#cc6f00', notification: '#FF8C00', placeholder: '#9aa4ae' as any, white: '#ffffff' as any },
  },
  brown: {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: '#8B5E3C', background: '#F3ECE6', card: '#ffffff', text: '#222222', border: '#6e472e', notification: '#8B5E3C', placeholder: '#9aa4ae' as any, white: '#ffffff' as any },
  },
  cocoa: { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: '#7B3F00', background: '#F3E6D6', card: '#ffffff', text: '#222222', border: '#5e2f00', notification: '#7B3F00', placeholder: '#9aa4ae' as any, white: '#ffffff' as any } },
  chestnut: { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: '#954535', background: '#F6E7E4', card: '#ffffff', text: '#222222', border: '#703428', notification: '#954535', placeholder: '#9aa4ae' as any, white: '#ffffff' as any } },
  caramel: { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: '#AF6E4D', background: '#F7EAE3', card: '#ffffff', text: '#222222', border: '#8b573d', notification: '#AF6E4D', placeholder: '#9aa4ae' as any, white: '#ffffff' as any } },
  latte: { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: '#A67B5B', background: '#F5ECE5', card: '#ffffff', text: '#222222', border: '#825f46', notification: '#A67B5B', placeholder: '#9aa4ae' as any, white: '#ffffff' as any } },
};
