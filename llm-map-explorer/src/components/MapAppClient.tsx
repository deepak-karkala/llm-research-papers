'use client';

import { ReactNode } from 'react';
import { useUrlStateLoader } from '@/hooks/useUrlStateLoader';
import { useUrlStateSync } from '@/hooks/useUrlStateSync';

interface MapAppClientProps {
  children: ReactNode;
}

/**
 * Client component wrapper that handles URL state synchronization
 * This component must be used client-side to access useSearchParams
 */
export function MapAppClient({ children }: MapAppClientProps) {
  // Load state from URL on mount
  useUrlStateLoader();

  // Sync state changes to URL with debouncing
  useUrlStateSync({ debounceMs: 500 });

  return <>{children}</>;
}
