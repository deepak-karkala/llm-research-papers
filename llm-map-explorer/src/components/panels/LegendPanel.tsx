'use client';

import { useState } from 'react';
import { useMapStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Capability } from '@/types/data';

/**
 * IconLegend Component
 * Displays the legend explaining landmark type icons
 */
function IconLegend() {
  const iconTypes = [
    { icon: '📄', label: 'Paper', description: 'Research Paper' },
    { icon: '🤖', label: 'Model', description: 'Foundation Model' },
    { icon: '🔧', label: 'Tool', description: 'Tool / Utility' },
    { icon: '📊', label: 'Benchmark', description: 'Benchmark / Dataset' },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Icons</h3>
      <div className="grid grid-cols-2 gap-2">
        {iconTypes.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * CapabilityLegend Component
 * Displays colored swatches for each capability region
 */
function CapabilityLegend({ capabilities }: { capabilities: Capability[] }) {
  // Get unique capabilities with their colors (limit to visible ones for brevity)
  const visibleCapabilities = capabilities.slice(0, 6);

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Capability Regions
      </h3>
      <div className="space-y-1.5">
        {visibleCapabilities.map((capability) => (
          <div
            key={capability.id}
            className="flex items-center gap-2"
            aria-label={`${capability.name} region - ${capability.visualStyleHints.fillColor}`}
          >
            <div
              className="w-3 h-3 rounded-sm border flex-shrink-0"
              style={{
                backgroundColor: capability.visualStyleHints.fillColor,
                opacity: capability.visualStyleHints.fillOpacity,
                borderColor: capability.visualStyleHints.strokeColor,
                borderWidth: '1px',
              }}
              aria-hidden="true"
            />
            <span className="text-xs truncate">{capability.name}</span>
          </div>
        ))}
        {capabilities.length > 6 && (
          <p className="text-xs text-muted-foreground italic pl-5">
            +{capabilities.length - 6} more...
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * ZoomIndicator Component
 * Displays current zoom level and visibility information
 */
function ZoomIndicator({ currentZoom }: { currentZoom: number }) {
  // Map zoom levels to readable names
  const getZoomInfo = (zoom: number) => {
    if (zoom < 0) {
      return {
        level: 0,
        name: 'Continental',
        visible: ['Continents'],
      };
    } else if (zoom < 1) {
      return {
        level: 1,
        name: 'Archipelago',
        visible: ['Continents', 'Archipelagos'],
      };
    } else {
      return {
        level: 2,
        name: 'Island',
        visible: ['Continents', 'Archipelagos', 'Islands'],
      };
    }
  };

  const zoomInfo = getZoomInfo(currentZoom);

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Zoom Level
      </h3>
      <div className="space-y-1">
        <p className="text-xs font-medium">
          Level {zoomInfo.level}: {zoomInfo.name}
        </p>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p className="font-medium">Visible:</p>
          {zoomInfo.visible.map((item, index) => (
            <p key={item} className="pl-2">
              {index < zoomInfo.visible.length ? '✓' : '○'} {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * LegendPanel Component
 * Fixed-position panel showing map legend, capability colors, and zoom level
 *
 * Features:
 * - Icon legend explaining landmark types
 * - Capability color swatches
 * - Current zoom level indicator
 * - Expand/collapse functionality
 * - Fully accessible with ARIA labels
 */
export function LegendPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentZoom, capabilities } = useMapStore();

  return (
    <div
      className="fixed bottom-4 right-4 z-40"
      role="region"
      aria-label="Map legend and zoom information"
      aria-live="polite"
    >
      <Card className="w-64 bg-background/95 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-3 pt-3 px-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-semibold">Legend</CardTitle>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-sm opacity-70 hover:opacity-100 transition-opacity p-1"
              aria-label={isExpanded ? 'Collapse legend details' : 'Expand legend details'}
              aria-expanded={isExpanded}
            >
              <svg
                className="w-4 h-4 transition-transform"
                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4 text-sm">
          {/* Always visible: Icon Legend */}
          <IconLegend />

          {/* Always visible: Zoom Indicator */}
          <ZoomIndicator currentZoom={currentZoom} />

          {/* Expanded: Capability Colors */}
          {isExpanded && capabilities.length > 0 && (
            <CapabilityLegend capabilities={capabilities} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
