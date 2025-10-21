
import { useEffect } from 'react';
import { useMapStore } from '@/lib/store';
import { normalizeCapability, normalizeLandmark } from '@/lib/data-normalizers';
import type { Capability, Landmark, Organization } from '@/types/data';

export function useInitializeMapData() {
  const { setCapabilities, setLandmarks, setOrganizations } = useMapStore((state) => ({
    setCapabilities: state.setCapabilities,
    setLandmarks: state.setLandmarks,
    setOrganizations: state.setOrganizations,
  }));

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        if (typeof window === 'undefined') {
          return;
        }

        const [capabilitiesRes, landmarksRes, organizationsRes] = await Promise.all([
          fetch('/data/capabilities.json'),
          fetch('/data/landmarks.json'),
          fetch('/data/organizations.json'),
        ]);

        if (!isMounted) {
          return;
        }

        const rawCapabilities = (await capabilitiesRes.json()) as Parameters<typeof normalizeCapability>[0][];
        const rawLandmarks = (await landmarksRes.json()) as Parameters<typeof normalizeLandmark>[0][];
        const organizationsData = (await organizationsRes.json()) as Organization[];

        const capabilitiesData: Capability[] = rawCapabilities.map((capability) => normalizeCapability(capability));
        const landmarksData: Landmark[] = rawLandmarks.map((landmark) => normalizeLandmark(landmark));

        setCapabilities(capabilitiesData);
        setLandmarks(landmarksData);
        setOrganizations(organizationsData);
      } catch (error) {
        console.error('Failed to load map data:', error);
        if (isMounted) {
          setCapabilities([]);
          setLandmarks([]);
          setOrganizations([]);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [setCapabilities, setLandmarks, setOrganizations]);
}
