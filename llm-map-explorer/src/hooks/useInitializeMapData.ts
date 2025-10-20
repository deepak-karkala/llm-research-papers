
import { useEffect } from 'react';
import { useMapStore } from '@/lib/store';
import type { Capability } from '@/types/data';

export function useInitializeMapData() {
  const setCapabilities = useMapStore((state) => state.setCapabilities);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        if (typeof window === 'undefined') {
          return;
        }

        const capabilitiesRes = await fetch('/data/capabilities.json');
        if (!isMounted) {
          return;
        }

        const capabilitiesData = (await capabilitiesRes.json()) as Capability[];
        setCapabilities(capabilitiesData);
      } catch (error) {
        console.error('Failed to load map data:', error);
        if (isMounted) {
          setCapabilities([]);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [setCapabilities]);
}
