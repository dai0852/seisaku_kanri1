"use client";

import { AppProvider } from '@/context/app-context';
import { AuthProvider } from '@/context/auth-context';
import { MainContent } from '@/components/main-content';

export default function Home() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
}
