'use client';

import { useMemo, useCallback } from 'react';
import { useMapStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import type { Organization } from '@/types/data';
import { cn } from '@/lib/utils';
import { getOrganizationLandmarks } from '@/lib/organization-utils';

interface OrganizationDetailsProps {
  organization: Organization;
  onLandmarkClick: (id: string) => void;
}

/**
 * OrganizationDetails Component
 *
 * Displays detailed information about an organization including:
 * - Organization name and description
 * - Website link if available
 * - Contribution count
 * - "Highlight on Map" button to highlight all org contributions
 * - List of related landmarks (papers, models, tools, etc.)
 */
export function OrganizationDetails({
  organization,
  onLandmarkClick,
}: OrganizationDetailsProps) {
  const {
    landmarks,
    highlightedOrgId,
    highlightOrganization,
    clearHighlights,
  } = useMapStore();

  // Determine if this organization is currently highlighted
  const isHighlighted = highlightedOrgId === organization.id;

  // Get all landmarks for this organization
  const orgLandmarks = useMemo(() => getOrganizationLandmarks(organization, landmarks), [organization, landmarks]);

  // Handle highlight button toggle
  const handleToggleHighlight = useCallback(() => {
    if (isHighlighted) {
      clearHighlights();
    } else {
      highlightOrganization(organization.id);
    }
  }, [isHighlighted, organization.id, highlightOrganization, clearHighlights]);

  const getLandmarkTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      paper: '📄',
      model: '🚢',
      tool: '🔧',
      benchmark: '🎯',
    };
    return icons[type] || '📌';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-left">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">{organization.name}</h2>

          {/* Organization Color Indicator */}
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border-2 border-current"
              style={{ backgroundColor: organization.color }}
              aria-hidden="true"
            />
            <span className="text-sm text-muted-foreground">
              {orgLandmarks.length}{' '}
              {orgLandmarks.length === 1 ? 'contribution' : 'contributions'}
            </span>
          </div>
        </div>
      </div>

      {/* Description and Links */}
      <div className="space-y-4">
        {/* Description */}
        <div>
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {organization.description}
          </p>
        </div>

        {/* Website Link */}
        {organization.website && (
          <div>
            <h3 className="font-semibold mb-2">Website</h3>
            <a
              href={organization.website}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                aria-label={`Visit ${organization.name} website`}
              >
                {organization.website}
                <span className="ml-auto text-xs">↗</span>
              </Button>
            </a>
          </div>
        )}

        {/* Highlight Button */}
        <div>
          <h3 className="font-semibold mb-2">Highlight on Map</h3>
          <Button
            onClick={handleToggleHighlight}
            aria-pressed={isHighlighted}
            className={cn(
              'w-full',
              isHighlighted && 'highlight-button-active'
            )}
            style={
              isHighlighted
                ? {
                    backgroundColor: organization.color,
                    borderColor: organization.color,
                  }
                : undefined
            }
            aria-label={
              isHighlighted
                ? `Clear highlights for ${organization.name} contributions`
                : `Highlight all ${organization.name} contributions on the map`
            }
          >
            {isHighlighted ? 'Clear Highlights' : 'Highlight on Map'}
          </Button>
        </div>

        {/* Related Landmarks */}
        {orgLandmarks.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">
              Contributions ({orgLandmarks.length})
            </h3>
            <div className="space-y-2">
              {orgLandmarks.map((landmark) => (
                <button
                  key={landmark.id}
                  onClick={() => onLandmarkClick(landmark.id)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getLandmarkTypeIcon(landmark.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {landmark.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {landmark.type} • {landmark.year}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {orgLandmarks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              No contributions yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

OrganizationDetails.displayName = 'OrganizationDetails';
