'use client';

import React, { useState, useEffect, ReactNode } from 'react';

interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Completely prevent SSR - return null on server
  if (typeof window === 'undefined') {
    return null;
  }

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
