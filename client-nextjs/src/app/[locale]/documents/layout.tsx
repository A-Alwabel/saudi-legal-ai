'use client';

import { ModernLayout } from '@/components/modern/ModernLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ClientOnlyLayout } from '@/components/ClientOnlyLayout';

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ClientOnlyLayout>
        <ModernLayout>{children}</ModernLayout>
      </ClientOnlyLayout>
    </ProtectedRoute>
  );
}
