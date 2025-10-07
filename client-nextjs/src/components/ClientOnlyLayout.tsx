'use client';

import React, { useEffect, useState } from 'react';

interface ClientOnlyLayoutProps {
  children: React.ReactNode;
}

export function ClientOnlyLayout({ children }: ClientOnlyLayoutProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}