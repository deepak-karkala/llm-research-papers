// src/app/page.tsx
'use client'; // Required for useState and event handlers

import React, { useState } from 'react'; // Import useState
import MapViewer from '@/components/map/MapViewer';
import TimelineViewer from '@/components/timeline/TimelineViewer';
import { TimelineEvent } from '../types/data'; // Adjust path as needed for TimelineEvent type

export default function HomePage() {
  const [selectedTimelineEventForMap, setSelectedTimelineEventForMap] = useState<TimelineEvent | null>(null);

  const handleTimelineEventSelect = (event: TimelineEvent) => {
    setSelectedTimelineEventForMap(event);
  };

  const clearTimelineEventFocus = () => {
    setSelectedTimelineEventForMap(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flexGrow: 1, position: 'relative' }}>
        <MapViewer 
          timelineEventToFocus={selectedTimelineEventForMap}
          onClearTimelineEventFocus={clearTimelineEventFocus}
        />
      </div>
      <div style={{ flexShrink: 0, maxHeight: '35vh', overflowY: 'auto', borderTop: '2px solid #A1887F' }}>
        <TimelineViewer onEventSelect={handleTimelineEventSelect} />
      </div>
    </div>
  );
}
