import { AuthProvider } from '@/features/auth/context/auth-context';
import { RootNavigator } from './navigation/root-navigator';

export function AppRoot() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}