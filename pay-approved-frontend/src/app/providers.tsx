import React from 'react';
import { View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppErrorBoundary } from '@/components/error-boundary';

import { queryClient } from '@/lib/react-query';

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <View style={{ flex: 1 }}>
            {children}
          </View>
        </SafeAreaProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
