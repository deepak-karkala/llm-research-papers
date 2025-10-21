
import { useEffect } from 'react';
import { useMapStore } from '@/lib/store';
import type { Capability, Landmark } from '@/types/data';

export function useInitializeMapData() {
  const { setCapabilities, setLandmarks } = useMapStore((state) => ({
    setCapabilities: state.setCapabilities,
    setLandmarks: state.setLandmarks,
  }));

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        if (typeof window === 'undefined') {
          return;
        }

        const [capabilitiesRes, landmarksRes] = await Promise.all([
          fetch('/data/capabilities.json'),
          fetch('/data/landmarks.json'),
        ]);

        if (!isMounted) {
          return;
        }

        const capabilitiesData = (await capabilitiesRes.json()) as Capability[];
        const landmarksData = (await landmarksRes.json()) as Landmark[];

        setCapabilities(capabilitiesData);
        setLandmarks(landmarksData);
      } catch (error) {
        console.error('Failed to load map data:', error);
        if (isMounted) {
          setCapabilities([]);
          setLandmarks([]);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [setCapabilities, setLandmarks]);
}
