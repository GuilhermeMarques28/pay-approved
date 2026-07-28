import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Dashboard: undefined;
  Registration: undefined;
  Contracts: undefined;
  Documents: undefined;
  Alerts: undefined;
};

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['payapproved://', 'https://payapproved.app'],
  config: {
    screens: {
      Auth: 'auth',
      Main: {
        screens: {
          Dashboard: 'dashboard',
          Registration: 'registration',
          Contracts: 'contracts',
          Documents: 'documents',
          Alerts: 'alerts',
        },
      },
    },
  },
  getInitialURL: async () => {
    const url = await Linking.getInitialURL();
    return url;
  },
  subscribe: (callback: (url: string | null) => void) => {
    const listener = Linking.addEventListener('url', ({ url }) => {
      callback(url);
    });
    return () => listener.remove();
  },
};