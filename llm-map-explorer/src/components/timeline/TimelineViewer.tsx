// src/components/timeline/TimelineViewer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { TimelineEvent } from '../../types/data'; // Corrected path
import styles from './TimelineViewer.module.css';

interface TimelineViewerProps { // Defined props interface
  onEventSelect: (event: TimelineEvent) => void;
}

const TimelineViewer: React.FC<TimelineViewerProps> = ({ onEventSelect }) => { // Destructure onEventSelect from props
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimelineEvents = async () => {
      try {
        const response = await fetch('/data/timelineEvents.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: TimelineEvent[] = await response.json();
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEvents(data);
      } catch (e) {
        console.error("Failed to fetch timeline events:", e);
        setError(e instanceof Error ? e.message : String(e));
      }
    };

    fetchTimelineEvents();
  }, []);

  if (error) {
    return <div className={styles.errorState}>Error loading timeline: {error}</div>;
  }

  if (events.length === 0 && !error) {
    return <div className={styles.loadingState}>Loading timeline events...</div>;
  }

  return (
    <div className={styles.timelineContainer}>
      <h3 className={styles.timelineTitle}>Age of Discovery Timeline</h3>
      <ul className={styles.eventList}>
        {events.map((event) => (
          <li 
            key={event.id} 
            className={styles.eventItem} 
            onClick={() => onEventSelect(event)} // Call onEventSelect
            title={`Click to learn more about ${event.eventName}`}
          >
            <div className={styles.eventDate}>{event.date}</div>
            <div className={styles.eventDetails}>
              <h4 className={styles.eventName}>{event.eventName}</h4>
              <p className={styles.eventDescription}>{event.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimelineViewer;
