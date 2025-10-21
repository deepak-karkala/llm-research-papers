'use client';

import React, { useMemo, useCallback } from 'react';
import { useMapStore } from '@/lib/store';
import { X } from 'lucide-react';

/**
 * HighlightBadge Component
 *
 * Displays information about the currently highlighted organization, including:
 * - Organization name
 * - Count of highlighted contributions
 * - Clear button to remove highlighting
 *
 * Only visible when an organization is currently highlighted.
 */
export function HighlightBadge() {
  const { highlightedOrgId, highlightedLandmarkIds, organizations, clearHighlights } =
    useMapStore();

  // Find the highlighted organization
  const highlightedOrg = useMemo(
    () => organizations.find((o) => o.id === highlightedOrgId),
    [organizations, highlightedOrgId]
  );

  // Handle clear button click
  const handleClear = useCallback(() => {
    clearHighlights();
  }, [clearHighlights]);

  // Don't render if no organization is highlighted
  if (!highlightedOrgId || !highlightedOrg) {
    return null;
  }

  const count = highlightedLandmarkIds.length;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 z-50"
      role="status"
      aria-live="polite"
      aria-label={`Highlighting ${highlightedOrg.name}: ${count} contributions`}
    >
      {/* Organization color indicator */}
      <div
        className="flex-shrink-0 w-3 h-3 rounded-full"
        style={{ backgroundColor: highlightedOrg.color }}
        aria-hidden="true"
      />

      {/* Badge text */}
      <div className="text-sm font-medium text-foreground">
        <span className="font-semibold">{highlightedOrg.name}</span>
        {' · '}
        <span className="text-muted-foreground">
          {count} {count === 1 ? 'contribution' : 'contributions'}
        </span>
      </div>

      {/* Clear button */}
      <button
        onClick={handleClear}
        className="flex-shrink-0 p-1 hover:bg-secondary rounded transition-colors duration-200"
        title="Clear highlighting"
        aria-label={`Clear highlighting for ${highlightedOrg.name}`}
      >
        <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
      </button>
    </div>
  );
}

HighlightBadge.displayName = 'HighlightBadge';
