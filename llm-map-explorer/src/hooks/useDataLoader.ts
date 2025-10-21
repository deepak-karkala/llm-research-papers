import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useMapStore } from '@/lib/store';
import {
  capabilitySchema,
  landmarkSchema,
  organizationSchema,
} from '@/lib/schemas';
import type { Capability, Landmark, Organization } from '@/types/data';
import { normalizeCapability, normalizeLandmark } from '@/lib/data-normalizers';

/**
 * Represents the state returned by the useDataLoader hook
 */
export interface DataLoaderState {
  loading: boolean;
  error: Error | null;
  data: {
    capabilities: Capability[];
    landmarks: Landmark[];
    organizations: Organization[];
  } | null;
}

/**
 * Configuration for retry logic
 */
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  initialDelay: 500, // 500ms
  backoffMultiplier: 2,
};

/**
 * Fetches a JSON file with retry logic and exponential backoff
 */
async function fetchWithRetry(
  url: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<Response> {
  let lastError: Error | null = null;
  let delay = config.initialDelay;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${url}: ${response.status} ${response.statusText}`
        );
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < config.maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= config.backoffMultiplier;
      }
    }
  }

  throw lastError || new Error(`Failed to fetch ${url} after ${config.maxRetries + 1} attempts`);
}

/**
 * Custom React hook to load and validate all static JSON data at app startup.
 *
 * This hook handles:
 * - Parallel fetching of capabilities, landmarks, and organizations
 * - Zod schema validation for data integrity
 * - Error handling with retry logic
 * - SSR safety
 * - Zustand store integration
 * - Memoization to prevent unnecessary re-fetching
 *
 * @returns DataLoaderState with loading, error, and data states
 *
 * @example
 * ```tsx
 * const { loading, error, data } = useDataLoader();
 *
 * if (loading) return <LoadingScreen />;
 * if (error) return <ErrorScreen error={error} />;
 * if (!data) return <ErrorScreen error={new Error('No data')} />;
 *
 * // Use data...
 * ```
 */
export function useDataLoader(): DataLoaderState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<DataLoaderState['data']>(null);

  const { setCapabilities, setLandmarks, setOrganizations } = useMapStore((state) => ({
    setCapabilities: state.setCapabilities,
    setLandmarks: state.setLandmarks,
    setOrganizations: state.setOrganizations,
  }));

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // SSR safety check
        if (typeof window === 'undefined') {
          return;
        }

        // 1. Parallel Fetching - Fetch all JSON files simultaneously
        const [capabilitiesRes, landmarksRes, organizationsRes] = await Promise.all([
          fetchWithRetry('/data/capabilities.json'),
          fetchWithRetry('/data/landmarks.json'),
          fetchWithRetry('/data/organizations.json'),
        ]);

        if (!isMounted) {
          return;
        }

        // 2. JSON Parsing
        let rawCapabilities: unknown;
        let rawLandmarks: unknown;
        let rawOrganizations: unknown;

        try {
          rawCapabilities = await capabilitiesRes.json();
          rawLandmarks = await landmarksRes.json();
          rawOrganizations = await organizationsRes.json();
        } catch (parseError) {
          throw new Error(
            `Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
          );
        }

        if (!isMounted) {
          return;
        }

        // 3. Zod Validation - Validate against schemas
        let capabilities: Capability[];
        let landmarks: Landmark[];
        let organizations: Organization[];

        try {
          const normalizedCapabilities = (rawCapabilities as Parameters<typeof normalizeCapability>[0][]).map(
            (capability) => normalizeCapability(capability)
          );
          const normalizedLandmarks = (rawLandmarks as Parameters<typeof normalizeLandmark>[0][]).map(
            (landmark) => normalizeLandmark(landmark)
          );

          capabilities = z.array(capabilitySchema).parse(normalizedCapabilities);
          landmarks = z.array(landmarkSchema).parse(normalizedLandmarks);
          organizations = z.array(organizationSchema).parse(rawOrganizations);
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            const errorDetails = validationError.errors
              .map((err) => `${err.path.join('.')}: ${err.message}`)
              .join('; ');
            throw new Error(`Data validation failed: ${errorDetails}`);
          }
          throw new Error(
            `Validation error: ${validationError instanceof Error ? validationError.message : 'Unknown validation error'}`
          );
        }

        if (!isMounted) {
          return;
        }

        // 4. Store data and update Zustand store
        const loadedData = { capabilities, landmarks, organizations };
        setData(loadedData);

        // Update Zustand store for use throughout the app
        setCapabilities(capabilities);
        setLandmarks(landmarks);
        setOrganizations(organizations);

        setError(null);
        setLoading(false);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setData(null);
        setLoading(false);

        // Also clear store on error
        setCapabilities([]);
        setLandmarks([]);
        setOrganizations([]);

        console.error('Failed to load map data:', error);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [setCapabilities, setLandmarks, setOrganizations]);

  // Memoize the return object to prevent unnecessary re-renders
  const memoizedState = useMemo(
    () => ({
      loading,
      error,
      data,
    }),
    [loading, error, data]
  );

  return memoizedState;
}
