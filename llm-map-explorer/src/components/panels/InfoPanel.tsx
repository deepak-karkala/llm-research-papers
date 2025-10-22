
'use client';

import { useMemo, useCallback } from 'react';
import { useMapStore } from '@/lib/store';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { Capability, Landmark, Organization } from '@/types/data';
import { OrganizationDetails } from './OrganizationDetails';
import { TourPanel } from './TourPanel';
import {
  formatCapabilityLevel,
  formatLandmarkType,
  getLandmarkTypeColor,
  getCapabilityLevelColor,
  getLandmarkTypeIcon,
  formatYear,
} from '@/lib/formatters';
import { cn, focusEntity as focusEntityUtil } from '@/lib/utils';
import { findOrganizationForLandmark } from '@/lib/organization-utils';

type InfoPanelVariant = 'persistent' | 'mobile';

/**
 * CapabilityDetails Component
 * Displays detailed information about a capability region
 */
function CapabilityDetails({
  capability,
  onRelatedLandmarkClick,
}: {
  capability: Capability;
  onRelatedLandmarkClick: (id: string) => void;
}) {
  const { landmarks } = useMapStore();

  const relatedLandmarks = useMemo(
    () => landmarks.filter((l) => capability.relatedLandmarks.includes(l.id)),
    [landmarks, capability.relatedLandmarks]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{capability.name}</h2>
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCapabilityLevelColor(capability.level)}`}>
                {formatCapabilityLevel(capability.level)}
              </span>
            </div>
          </div>
        </div>
        <p className="text-base mt-2 text-muted-foreground">{capability.shortDescription}</p>
      </div>

      <div className="space-y-4">
        {/* Visual Style Preview */}
        <div className="flex gap-2">
          <div
            className="w-12 h-12 rounded border-2"
            style={{
              backgroundColor: capability.visualStyleHints.fillColor,
              opacity: capability.visualStyleHints.fillOpacity,
              borderColor: capability.visualStyleHints.strokeColor,
              borderWidth: capability.visualStyleHints.strokeWeight,
            }}
            title="Region color preview"
          />
          <div className="flex-1 text-sm">
            <p className="font-medium">Visual Style</p>
            <p className="text-muted-foreground text-xs">
              {capability.visualStyleHints.fillColor} • {capability.visualStyleHints.fillOpacity}
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{capability.description}</p>
        </div>

        {/* Related Landmarks */}
        {relatedLandmarks.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">
              Related Landmarks ({relatedLandmarks.length})
            </h3>
            <div className="space-y-2">
              {relatedLandmarks.map((landmark) => (
                <button
                  key={landmark.id}
                  onClick={() => onRelatedLandmarkClick(landmark.id)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getLandmarkTypeIcon(landmark.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{landmark.name}</p>
                      <p className="text-xs text-muted-foreground">{landmark.year}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * LandmarkDetails Component
 * Displays detailed information about a landmark (paper, model, tool, etc.)
 */
function LandmarkDetails({
  landmark,
  onParentCapabilityClick,
  onOrganizationClick,
}: {
  landmark: Landmark;
  onParentCapabilityClick: (id: string) => void;
  onOrganizationClick?: (orgName: string) => void;
}) {
  const { capabilities, organizations } = useMapStore();
  const matchedOrganization = useMemo(
    () => findOrganizationForLandmark(organizations, landmark),
    [organizations, landmark]
  );

  const parentCapability = useMemo(
    () => capabilities.find((c) => c.id === landmark.capabilityId),
    [capabilities, landmark.capabilityId]
  );

  const hasAbstract = landmark.abstract && landmark.abstract.length > 0;
  const hasLinks = landmark.externalLinks && landmark.externalLinks.length > 0;
  const hasTags = landmark.tags && landmark.tags.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-left">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">{landmark.name}</h2>

          {/* Type Badge and Year */}
          <div className="flex items-center gap-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLandmarkTypeColor(landmark.type)}`}>
              {getLandmarkTypeIcon(landmark.type)} {formatLandmarkType(landmark.type)}
            </span>
            <span className="text-sm text-muted-foreground">{formatYear(landmark.year)}</span>
          </div>

          {/* Organization */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (matchedOrganization && onOrganizationClick) {
                  onOrganizationClick(matchedOrganization.id);
                }
              }}
              className={cn(
                'text-sm',
                matchedOrganization
                  ? 'text-muted-foreground hover:text-primary hover:underline transition-colors cursor-pointer'
                  : 'text-muted-foreground cursor-not-allowed'
              )}
              title={
                matchedOrganization
                  ? `View ${matchedOrganization.name} details`
                  : `${landmark.organization} (organization details unavailable)`
              }
              disabled={!matchedOrganization}
            >
              {matchedOrganization?.name ?? landmark.organization}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Description */}
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{landmark.description}</p>
        </div>

        {/* Abstract */}
        {hasAbstract && landmark.abstract && (
          <div>
            <h3 className="font-semibold mb-2">Abstract</h3>
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">
              {landmark.abstract}
            </p>
            {landmark.abstract.length > 500 && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                (Abstract truncated. View full paper on external link)
              </p>
            )}
          </div>
        )}

        {/* Tags */}
        {hasTags && (
          <div>
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {landmark.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* External Links */}
        {hasLinks && (
          <div>
            <h3 className="font-semibold mb-2">Resources</h3>
            <div className="space-y-2">
              {landmark.externalLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    aria-label={`Open ${link.label} in new tab`}
                  >
                    {link.label}
                    <span className="ml-auto text-xs">↗</span>
                  </Button>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Parent Capability */}
        {parentCapability && (
          <div>
            <h3 className="font-semibold mb-2">Part of Capability</h3>
            <button
              onClick={() => onParentCapabilityClick(parentCapability.id)}
              className="w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{parentCapability.name}</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getCapabilityLevelColor(parentCapability.level)}`}>
                  {formatCapabilityLevel(parentCapability.level)}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * WelcomeContent Component
 * Displays welcome message and guide for using the map
 */
function WelcomeContent() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">LLM Research Map</h1>
        <p className="text-sm text-muted-foreground">
          Explore the landscape of Large Language Models, papers, and key research
        </p>
      </div>

      {/* Quick Start */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Getting Started</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium mb-1">📍 Click on Landmarks</p>
            <p className="text-muted-foreground">
              Select research papers, models, and tools to see detailed information about each contribution.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">🗺️ Explore Capabilities</p>
            <p className="text-muted-foreground">
              Click on colored regions to learn about different capability areas in LLM research.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">🔍 Zoom & Pan</p>
            <p className="text-muted-foreground">
              Zoom in to discover more specific landmarks. Use the zoom controls or your mouse wheel.
            </p>
          </div>
        </div>
      </div>

      {/* Progressive Disclosure */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Map Layers</h2>
        <p className="text-sm text-muted-foreground">
          The map reveals different landmarks based on your zoom level:
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="inline-block w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center text-white text-xs flex-shrink-0">
              1
            </span>
            <div>
              <p className="font-medium">Foundational Papers</p>
              <p className="text-xs text-muted-foreground">Visible at max zoom out (seminal works)</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-block w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded flex items-center justify-center text-white text-xs flex-shrink-0">
              2
            </span>
            <div>
              <p className="font-medium">Key Models & Papers</p>
              <p className="text-xs text-muted-foreground">Revealed at medium zoom level</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-block w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center text-white text-xs flex-shrink-0">
              3
            </span>
            <div>
              <p className="font-medium">Complete Landscape</p>
              <p className="text-xs text-muted-foreground">All 26 landmarks at full zoom</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Features</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">✓</span>
            <span>Deep links between papers, models, and capabilities</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">✓</span>
            <span>External links to original research and resources</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">✓</span>
            <span>Organized by research capability areas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">✓</span>
            <span>Zoom-based progressive disclosure</span>
          </li>
        </ul>
      </div>

      {/* Tips */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Tips</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>💡 Hover over landmarks to see their name and year</li>
          <li>🔗 Click &quot;Part of Capability&quot; to jump to region details</li>
          <li>📖 Click related papers to explore connections</li>
          <li>🌐 Use external links to read full papers</li>
        </ul>
      </div>

      {/* Placeholder for future features */}
      <div className="pt-2 mt-4 border-t">
        <p className="text-xs text-muted-foreground italic">
          ✨ Guided tours coming soon! Follow curated paths through the research landscape.
        </p>
      </div>
    </div>
  );
}

/**
 * PersistentPanelContent Component
 * Renders content for persistent panel (desktop variant)
 */
function PersistentPanelContent({
  selectedEntity,
  entity,
  onRelatedLandmarkClick,
  onParentCapabilityClick,
  onLandmarkClick,
  onOrganizationClick,
}: {
  selectedEntity: { type: 'capability' | 'landmark' | 'organization'; id: string } | null;
  entity: Capability | Landmark | Organization | null;
  onRelatedLandmarkClick: (id: string) => void;
  onParentCapabilityClick: (id: string) => void;
  onLandmarkClick: (id: string) => void;
  onOrganizationClick: (id: string) => void;
}) {
  if (!entity) {
    return <WelcomeContent />;
  }

  return (
    <div className="p-6 space-y-6">
      {selectedEntity?.type === 'capability' ? (
        <CapabilityDetails
          capability={entity as Capability}
          onRelatedLandmarkClick={onRelatedLandmarkClick}
        />
      ) : selectedEntity?.type === 'landmark' ? (
        <LandmarkDetails
          landmark={entity as Landmark}
          onParentCapabilityClick={onParentCapabilityClick}
          onOrganizationClick={onOrganizationClick}
        />
      ) : (
        <OrganizationDetails
          organization={entity as Organization}
          onLandmarkClick={onLandmarkClick}
        />
      )}
    </div>
  );
}

/**
 * InfoPanel Component
 * Displays information about the LLM Research Map
 *
 * Supports two variants:
 * - persistent: Always visible on desktop (right side)
 * - mobile: Bottom sheet overlay on mobile devices
 *
 * States:
 * - Default: Shows welcome content with map guide
 * - Entity Selected: Shows capability or landmark details
 * - Tour Active: Shows tour stepper (future)
 */
export function InfoPanel({ variant = 'persistent' }: { variant?: InfoPanelVariant }) {
  const { selectedEntity, capabilities, landmarks, organizations, clearSelection, selectEntity, currentTour } = useMapStore();
  const mapRef = useMapStore((state) => state.mapRef);

  const isOpen = !!selectedEntity || !!currentTour;

  const entity: Capability | Landmark | Organization | null = selectedEntity
    ? selectedEntity.type === 'capability'
      ? capabilities.find((c) => c.id === selectedEntity.id) ?? null
      : selectedEntity.type === 'landmark'
        ? landmarks.find((l) => l.id === selectedEntity.id) ?? null
        : organizations.find((o) => o.id === selectedEntity.id) ?? null
    : null;

  const focusLandmark = useCallback(
    (landmarkId: string) => {
      const landmarkEntity = landmarks.find((l) => l.id === landmarkId);
      if (!landmarkEntity) {
        return;
      }
      if (mapRef) {
        focusEntityUtil(landmarkId, 'landmark', mapRef, landmarkEntity, landmarks);
      } else {
        selectEntity('landmark', landmarkId);
      }
    },
    [landmarks, mapRef, selectEntity]
  );

  const focusCapability = useCallback(
    (capabilityId: string) => {
      const capabilityEntity = capabilities.find((c) => c.id === capabilityId);
      if (!capabilityEntity) {
        return;
      }
      if (mapRef) {
        focusEntityUtil(capabilityId, 'capability', mapRef, capabilityEntity, landmarks);
      } else {
        selectEntity('capability', capabilityId);
      }
    },
    [capabilities, mapRef, landmarks, selectEntity]
  );

  const handleRelatedLandmarkClick = useCallback(
    (landmarkId: string) => {
      focusLandmark(landmarkId);
    },
    [focusLandmark]
  );

  const handleParentCapabilityClick = useCallback(
    (capabilityId: string) => {
      focusCapability(capabilityId);
    },
    [focusCapability]
  );

  const handleOrganizationClick = (orgId: string) => {
    selectEntity('organization', orgId);
  };

  // Desktop variant - always visible, scrollable
  if (variant === 'persistent') {
    // Show TourPanel when a tour is active
    if (currentTour) {
      return <TourPanel />;
    }

    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header with close button */}
        {isOpen && (
          <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/50">
            <h2 className="font-semibold text-sm truncate">
              {entity && selectedEntity?.type === 'capability'
                ? (entity as Capability).name
                : entity && selectedEntity?.type === 'landmark'
                  ? (entity as Landmark).name
                  : entity && selectedEntity?.type === 'organization'
                    ? (entity as Organization).name
                    : 'Map Guide'}
            </h2>
            <button
              onClick={clearSelection}
              className="rounded-sm opacity-70 hover:opacity-100 transition-opacity p-1"
              aria-label="Close"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <PersistentPanelContent
            selectedEntity={selectedEntity}
            entity={entity}
            onRelatedLandmarkClick={handleRelatedLandmarkClick}
            onParentCapabilityClick={handleParentCapabilityClick}
            onLandmarkClick={handleRelatedLandmarkClick}
            onOrganizationClick={handleOrganizationClick}
          />
        </div>
      </div>
    );
  }

  // Mobile variant - sheet overlay
  // Only render on mobile (check via window width since lg:hidden is CSS-based)
  if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
    return null; // Don't render on desktop
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && clearSelection()}>
      <SheetContent
        side="bottom"
        className={`w-full overflow-hidden flex flex-col rounded-t-lg ${currentTour ? 'h-[75vh]' : 'h-[70vh]'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-4">
          <div className="w-12 h-1 bg-muted rounded-full" />
        </div>

        {/* Scrollable content */}
        {currentTour ? (
          <TourPanel />
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {entity ? (
              <>
                {selectedEntity?.type === 'capability' ? (
                  <CapabilityDetails
                    capability={entity as Capability}
                    onRelatedLandmarkClick={handleRelatedLandmarkClick}
                  />
                ) : selectedEntity?.type === 'landmark' ? (
                  <LandmarkDetails
                    landmark={entity as Landmark}
                    onParentCapabilityClick={handleParentCapabilityClick}
                    onOrganizationClick={handleOrganizationClick}
                  />
                ) : (
                  <OrganizationDetails
                    organization={entity as Organization}
                    onLandmarkClick={handleRelatedLandmarkClick}
                  />
                )}
              </>
            ) : (
              <WelcomeContent />
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
