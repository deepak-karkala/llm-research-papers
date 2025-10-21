/**
 * SearchBar component with instant dropdown and fuzzy search
 * Provides keyboard-navigable search across papers, models, capabilities, and organizations
 * Based on front-end-spec.md Section 6.2 and architecture.md Section 5.4
 */

'use client';

import * as React from 'react';
import { Search, FileText, Box, Building2, Map } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useMapStore } from '@/lib/store';
import { initializeSearchIndex, search as performSearch } from '@/lib/search';
import type { SearchResult } from '@/types/search';
import type { Landmark } from '@/types/data';
import { cn } from '@/lib/utils';

/**
 * Hook to debounce a value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Get icon for entity type
 */
function getEntityIcon(entityType: string, landmarkType?: string) {
  if (entityType === 'landmark') {
    if (landmarkType === 'paper') return FileText;
    if (landmarkType === 'model') return Box;
  }
  if (entityType === 'capability') return Map;
  if (entityType === 'organization') return Building2;
  return Search;
}

/**
 * Get display label for entity type
 */
function getEntityTypeLabel(entityType: string, landmarkType?: string): string {
  if (entityType === 'landmark') {
    if (landmarkType === 'paper') return 'Paper';
    if (landmarkType === 'model') return 'Model';
    if (landmarkType === 'tool') return 'Tool';
    if (landmarkType === 'benchmark') return 'Benchmark';
  }
  if (entityType === 'capability') return 'Capability';
  if (entityType === 'organization') return 'Organization';
  return entityType;
}

/**
 * Group search results by entity type
 */
interface GroupedResults {
  papers: SearchResult[];
  models: SearchResult[];
  capabilities: SearchResult[];
  organizations: SearchResult[];
  other: SearchResult[];
}

function groupSearchResults(results: SearchResult[]): GroupedResults {
  const grouped: GroupedResults = {
    papers: [],
    models: [],
    capabilities: [],
    organizations: [],
    other: [],
  };

  results.forEach((result) => {
    if (result.entityType === 'landmark') {
      const landmark = result.item as Landmark;
      if (landmark.type === 'paper') {
        grouped.papers.push(result);
      } else if (landmark.type === 'model') {
        grouped.models.push(result);
      } else {
        grouped.other.push(result);
      }
    } else if (result.entityType === 'capability') {
      grouped.capabilities.push(result);
    } else if (result.entityType === 'organization') {
      grouped.organizations.push(result);
    } else {
      grouped.other.push(result);
    }
  });

  return grouped;
}

/**
 * SearchBar component props
 */
export interface SearchBarProps {
  /** Optional className for styling */
  className?: string;
  /** Optional placeholder text */
  placeholder?: string;
  /** Optional callback when a result is selected */
  onResultSelect?: (result: SearchResult) => void;
}

/**
 * SearchBar component with instant dropdown
 * Features:
 * - Fuzzy search across all entities
 * - Debounced input (300ms)
 * - Grouped results by type
 * - Keyboard navigation (built into Command component)
 * - Accessibility features
 */
export function SearchBar({ className, placeholder = 'Search papers, models, and capabilities...', onResultSelect }: SearchBarProps) {
  const [query, setQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const searchIndexRef = React.useRef<ReturnType<typeof initializeSearchIndex> | null>(null);

  // Get data from store
  const capabilities = useMapStore((state) => state.capabilities);
  const landmarks = useMapStore((state) => state.landmarks);
  const selectEntity = useMapStore((state) => state.selectEntity);

  // Debounce the query
  const debouncedQuery = useDebounce(query, 300);

  // Initialize search index when data is loaded
  React.useEffect(() => {
    if (capabilities.length > 0 || landmarks.length > 0) {
      searchIndexRef.current = initializeSearchIndex({
        capabilities,
        landmarks,
        organizations: [], // TODO: Load organizations when available
      });
    }
  }, [capabilities, landmarks]);

  // Perform search when debounced query changes
  React.useEffect(() => {
    if (debouncedQuery.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (!searchIndexRef.current) {
      setResults([]);
      return;
    }

    const searchResults = performSearch(debouncedQuery, searchIndexRef.current, 10);
    setResults(searchResults);
    setIsOpen(searchResults.length > 0);
  }, [debouncedQuery]);

  // Handle result selection
  const handleSelect = React.useCallback(
    (result: SearchResult) => {
      // Call custom callback if provided
      if (onResultSelect) {
        onResultSelect(result);
      }

      // Update store to select the entity
      if (result.entityType === 'capability') {
        selectEntity('capability', result.item.id);
      } else if (result.entityType === 'landmark') {
        selectEntity('landmark', result.item.id);
      }

      // Close dropdown and clear query
      setIsOpen(false);
      setQuery('');
      setResults([]);
    },
    [selectEntity, onResultSelect]
  );

  // Group results
  const groupedResults = React.useMemo(() => groupSearchResults(results), [results]);

  // Render result item
  const renderResultItem = React.useCallback(
    (result: SearchResult, index: number) => {
      const Icon = getEntityIcon(result.entityType, (result.item as Landmark).type);
      const typeLabel = getEntityTypeLabel(result.entityType, (result.item as Landmark).type);

      return (
        <CommandItem
          key={`${result.entityType}-${result.item.id}-${index}`}
          value={`${result.item.id}-${result.item.name}`}
          onSelect={() => handleSelect(result)}
          className="cursor-pointer"
        >
          <Icon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
          <div className="flex flex-col overflow-hidden">
            <span className="truncate font-medium">{result.item.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {typeLabel} · {result.item.description.slice(0, 60)}
              {result.item.description.length > 60 ? '...' : ''}
            </span>
          </div>
        </CommandItem>
      );
    },
    [handleSelect]
  );

  return (
    <div className={cn('relative w-full', className)}>
      <Command
        className="overflow-visible bg-background border rounded-md shadow-sm"
        shouldFilter={false} // We handle filtering ourselves with Fuse.js
      >
        <CommandInput
          placeholder={placeholder}
          value={query}
          onValueChange={setQuery}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            // Delay to allow click on result
            setTimeout(() => setIsOpen(false), 200);
          }}
          className="h-10"
          aria-label="Search papers, models, and capabilities"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={isOpen}
        />

        {isOpen && results.length > 0 && (
          <div
            id="search-results"
            className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95"
            role="listbox"
            aria-label="Search results"
          >
            <CommandList className="max-h-[400px]">
              <CommandEmpty>No results found.</CommandEmpty>

              {/* Papers */}
              {groupedResults.papers.length > 0 && (
                <CommandGroup heading="Papers">
                  {groupedResults.papers.map((result, index) => renderResultItem(result, index))}
                </CommandGroup>
              )}

              {/* Models */}
              {groupedResults.models.length > 0 && (
                <CommandGroup heading="Models">
                  {groupedResults.models.map((result, index) => renderResultItem(result, index))}
                </CommandGroup>
              )}

              {/* Capabilities */}
              {groupedResults.capabilities.length > 0 && (
                <CommandGroup heading="Capabilities">
                  {groupedResults.capabilities.map((result, index) => renderResultItem(result, index))}
                </CommandGroup>
              )}

              {/* Organizations */}
              {groupedResults.organizations.length > 0 && (
                <CommandGroup heading="Organizations">
                  {groupedResults.organizations.map((result, index) => renderResultItem(result, index))}
                </CommandGroup>
              )}

              {/* Other */}
              {groupedResults.other.length > 0 && (
                <CommandGroup heading="Other">
                  {groupedResults.other.map((result, index) => renderResultItem(result, index))}
                </CommandGroup>
              )}
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}
