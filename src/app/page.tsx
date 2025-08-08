import { AppProvider } from '@/context/app-context';
import { MainContent } from '@/components/main-content';

export default function Home() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
