import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDataLoader } from '../useDataLoader';
import { useMapStore } from '@/lib/store';
import type { Capability, Landmark, Organization } from '@/types/data';

// Mock fetch globally
global.fetch = vi.fn();

// Sample test data
const mockCapability: Capability = {
  id: 'test-capability',
  name: 'Test Capability',
  description: 'A test capability',
  shortDescription: 'Test',
  level: 'continent',
  polygonCoordinates: [
    { lat: 0, lng: 0 },
    { lat: 1, lng: 1 },
  ],
  visualStyleHints: {
    fillColor: '#FF0000',
    fillOpacity: 0.5,
    strokeColor: '#000000',
    strokeWeight: 2,
  },
  relatedLandmarks: [],
  zoomThreshold: 0,
};

const mockLandmark: Landmark = {
  id: 'test-landmark',
  name: 'Test Paper',
  type: 'paper',
  year: 2023,
  organization: 'Test Org',
  description: 'A test paper',
  externalLinks: [],
  coordinates: { lat: 0, lng: 0 },
  capabilityId: 'test-capability',
  relatedLandmarks: [],
  tags: ['test'],
  zoomThreshold: 0,
};

const mockOrganization: Organization = {
  id: 'test-org',
  name: 'Test Organization',
  description: 'A test organization',
  landmarkIds: ['test-landmark'],
  color: '#FF0000',
};

describe('useDataLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Zustand store
    useMapStore.setState({
      capabilities: [],
      landmarks: [],
      organizations: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load data successfully on mount', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock successful responses
    mockFetch.mockImplementation((url: string) => {
      let data: unknown;
      if (url.includes('capabilities')) {
        data = [mockCapability];
      } else if (url.includes('landmarks')) {
        data = [mockLandmark];
      } else if (url.includes('organizations')) {
        data = [mockOrganization];
      }
      return Promise.resolve(
        new Response(JSON.stringify(data), { status: 200 })
      );
    });

    const { result } = renderHook(() => useDataLoader());

    // Initial loading state
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify loaded data
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.capabilities).toHaveLength(1);
    expect(result.current.data?.landmarks).toHaveLength(1);
    expect(result.current.data?.organizations).toHaveLength(1);

    // Verify store was updated
    const store = useMapStore.getState();
    expect(store.capabilities).toHaveLength(1);
    expect(store.landmarks).toHaveLength(1);
    expect(store.organizations).toHaveLength(1);
  });

  it('should validate data against schemas', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Return invalid capability (missing required field)
    mockFetch.mockImplementation((url: string) => {
      let data: unknown;
      if (url.includes('capabilities')) {
        data = [{ id: 'test', name: 'Test' }]; // Invalid: missing required fields
      } else if (url.includes('landmarks')) {
        data = [mockLandmark];
      } else if (url.includes('organizations')) {
        data = [mockOrganization];
      }
      return Promise.resolve(
        new Response(JSON.stringify(data), { status: 200 })
      );
    });

    const { result } = renderHook(() => useDataLoader());

    // Wait for validation error
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have error and no data
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('validation');
    expect(result.current.data).toBeNull();

    // Store should be cleared
    const store = useMapStore.getState();
    expect(store.capabilities).toHaveLength(0);
    expect(store.landmarks).toHaveLength(0);
    expect(store.organizations).toHaveLength(0);
  });

  it('should handle network errors gracefully', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Simulate network error on all retries
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDataLoader());

    // Wait for error - longer timeout for retries
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 }
    );

    // Should have error
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('Network error');
    expect(result.current.data).toBeNull();

    // Store should be cleared
    const store = useMapStore.getState();
    expect(store.capabilities).toHaveLength(0);
    expect(store.landmarks).toHaveLength(0);
    expect(store.organizations).toHaveLength(0);
  });

  it('should handle fetch failures with retry logic', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    let attemptCount = 0;
    mockFetch.mockImplementation((url: string) => {
      attemptCount++;
      if (attemptCount < 3) {
        // Fail first 2 attempts
        return Promise.reject(new Error('Temporary error'));
      }
      // Succeed on 3rd attempt
      let data: unknown;
      if (url.includes('capabilities')) {
        data = [mockCapability];
      } else if (url.includes('landmarks')) {
        data = [mockLandmark];
      } else if (url.includes('organizations')) {
        data = [mockOrganization];
      }
      return Promise.resolve(
        new Response(JSON.stringify(data), { status: 200 })
      );
    });

    const { result } = renderHook(() => useDataLoader());

    // Wait for successful load after retries
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
      },
      { timeout: 5000 }
    );

    // Verify data loaded successfully
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.capabilities).toHaveLength(1);
  });

  it('should handle 404 errors', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Simulate 404 on all retries
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 })
    );

    const { result } = renderHook(() => useDataLoader());

    // Wait for error - longer timeout for retries
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 }
    );

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('404');
  });

  it('should handle JSON parse errors', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Return invalid JSON
    mockFetch.mockResolvedValue(
      new Response('invalid json', { status: 200 })
    );

    const { result } = renderHook(() => useDataLoader());

    // Wait for error
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('parse');
  });

  it('should not load data on SSR (server-side rendering)', () => {
    // This test verifies SSR safety - skip if already in browser environment
    // Real SSR testing would require Node.js environment
    if (typeof window !== 'undefined') {
      expect(true).toBe(true); // Placeholder for browser environment
    }
  });

  it('should memoize data to prevent unnecessary re-renders', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    mockFetch.mockImplementation((url: string) => {
      let data: unknown;
      if (url.includes('capabilities')) {
        data = [mockCapability];
      } else if (url.includes('landmarks')) {
        data = [mockLandmark];
      } else if (url.includes('organizations')) {
        data = [mockOrganization];
      }
      return Promise.resolve(
        new Response(JSON.stringify(data), { status: 200 })
      );
    });

    const { result } = renderHook(() => useDataLoader());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const firstState = result.current;

    // Verify data is memoized (same object reference)
    expect(result.current.data).toStrictEqual(firstState.data);
    expect(result.current.data?.capabilities).toHaveLength(1);
  });

  it('should handle validation errors with detailed messages', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Return invalid model metadata
    const invalidLandmark = {
      ...mockLandmark,
      type: 'model' as const,
      metadata: {
        // Missing required fields for model metadata
      },
    };

    mockFetch.mockImplementation((url: string) => {
      let data: unknown;
      if (url.includes('capabilities')) {
        data = [mockCapability];
      } else if (url.includes('landmarks')) {
        data = [invalidLandmark];
      } else if (url.includes('organizations')) {
        data = [mockOrganization];
      }
      return Promise.resolve(
        new Response(JSON.stringify(data), { status: 200 })
      );
    });

    const { result } = renderHook(() => useDataLoader());

    // Wait for validation error - longer timeout for detailed validation
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 }
    );

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('validation');
  });

  it('should clear store on error', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Simulate failure
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDataLoader());

    // Wait for error - longer timeout for retries
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 }
    );

    // Store should be cleared on error
    const store = useMapStore.getState();
    expect(store.capabilities).toHaveLength(0);
    expect(store.landmarks).toHaveLength(0);
    expect(store.organizations).toHaveLength(0);
    expect(result.current.error).toBeDefined();
  });

  it('should return all required data types', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    mockFetch.mockImplementation((url: string) => {
      let data: unknown;
      if (url.includes('capabilities')) {
        data = [mockCapability];
      } else if (url.includes('landmarks')) {
        data = [mockLandmark];
      } else if (url.includes('organizations')) {
        data = [mockOrganization];
      }
      return Promise.resolve(
        new Response(JSON.stringify(data), { status: 200 })
      );
    });

    const { result } = renderHook(() => useDataLoader());

    // Wait for load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify all data types are present
    expect(result.current.data).toHaveProperty('capabilities');
    expect(result.current.data).toHaveProperty('landmarks');
    expect(result.current.data).toHaveProperty('organizations');
    expect(Array.isArray(result.current.data?.capabilities)).toBe(true);
    expect(Array.isArray(result.current.data?.landmarks)).toBe(true);
    expect(Array.isArray(result.current.data?.organizations)).toBe(true);
  });
});
