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
  subscribe: (listener: (url: string) => void) => {
    const sub = Linking.addEventListener('url', ({ url }: { url: string }) => {
      listener(url);
    });
    return () => sub.remove();
  },
};
