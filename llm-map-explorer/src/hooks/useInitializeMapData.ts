
import { useEffect } from 'react';
import { useMapStore } from '@/lib/store';
import { normalizeCapability, normalizeLandmark } from '@/lib/data-normalizers';
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

        const rawCapabilities = (await capabilitiesRes.json()) as Parameters<typeof normalizeCapability>[0][];
        const rawLandmarks = (await landmarksRes.json()) as Parameters<typeof normalizeLandmark>[0][];

        const capabilitiesData: Capability[] = rawCapabilities.map((capability) => normalizeCapability(capability));
        const landmarksData: Landmark[] = rawLandmarks.map((landmark) => normalizeLandmark(landmark));

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
