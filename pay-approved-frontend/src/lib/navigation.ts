import * as Linking from 'expo-linking';

export const linking = {
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
