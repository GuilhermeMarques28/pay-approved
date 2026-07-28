import 'nativewind';
import { AppProviders } from './src/app/providers';
import { AppRoot } from './src/app/app-root';

export default function App() {
  return (
    <AppProviders>
      <AppRoot />
    </AppProviders>
  );
}
