import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'pay_approved_auth_token';

export const authToken = {
  get: async (): Promise<string | null> => {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  set: async (token: string): Promise<void> => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  remove: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
