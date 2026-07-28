import React from 'react';
import { View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider, SafeAreaListener } from 'react-native-safe-area-context';
import { ErrorBoundary } from 'react-error-boundary';
import { Uniwind } from 'nativewind';

import { queryClient } from '@/lib/react-query';
import { MainErrorFallback } from '@/components/error-boundary';

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <View className="flex-1">
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <SafeAreaListener
              onChange={({ insets }) => Uniwind.updateInsets(insets)}
            >
              {children}
            </SafeAreaListener>
          </SafeAreaProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </View>
  );
}