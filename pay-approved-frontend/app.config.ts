import type { ExpoConfig } from '@expo/config-types';

const config = {
  name: 'Pay Approved',
  slug: 'pay-approved',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  updates: {
    enabled: false,
  },
  plugins: [
    'expo-splash-screen',
    'expo-secure-store',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'O Pay Approved precisa da sua localização para enviar alertas de pagamento.',
        locationWhenInUsePermission: 'O Pay Approved precisa da sua localização para enviar alertas de pagamento.',
      },
    ],
    'expo-notifications',
  ],
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'O Pay Approved precisa da sua localização para enviar alertas de pagamento.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'O Pay Approved precisa da sua localização para enviar alertas de pagamento.',
    },
  },
  android: {
    permissions: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.POST_NOTIFICATIONS',
    ],
  },
  extra: {
    apiUrl: process.env.API_URL ?? 'http://localhost:3000',
  },
} as ExpoConfig;

export default config;
