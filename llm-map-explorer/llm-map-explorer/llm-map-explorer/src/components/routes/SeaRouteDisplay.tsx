// src/components/routes/SeaRouteDisplay.tsx
'use client';

import React from 'react';
import { SeaRoute, MapFeature, SeaRouteStage } from '../../types/data'; // Corrected path, added SeaRouteStage
import styles from './SeaRouteDisplay.module.css';

interface SeaRouteDisplayProps {
  route: SeaRoute | null;
  mapFeatures: MapFeature[];
  onStageSelect: (stage: SeaRouteStage, islandFeature: MapFeature | undefined) => void; // Updated prop
}

const SeaRouteDisplay: React.FC<SeaRouteDisplayProps> = ({ route, mapFeatures, onStageSelect }) => {
  if (!route) {
    return <div className={styles.noRouteSelected}>Select a Sea Route to view details.</div>;
  }

  const getFeatureName = (id: string) => mapFeatures.find(f => f.id === id)?.name || id;

  return (
    <div className={styles.seaRoutePanel}>
      <h3 className={styles.routeName}>{route.routeName}</h3>
      <p className={styles.routeDescription}>{route.description}</p>
      {route.startPointDescription && <p><strong>Start:</strong> {route.startPointDescription}</p>}
      <ul className={styles.stageList}>
        {route.stages.sort((a, b) => a.order - b.order).map((stage) => {
          const stageIsland = mapFeatures.find(mf => mf.id === stage.islandID);
          return (
            <li key={stage.stageID} className={styles.stageItem}>
              <strong 
                className={stageIsland ? styles.stageNameClickable : styles.stageName} // Apply clickable style if island exists
                onClick={() => stageIsland && onStageSelect(stage, stageIsland)} // Call onStageSelect
                title={stageIsland ? `Pan to ${stageIsland.name}` : 'Island data not found'}
              >
                {stage.stageName}
              </strong> ({getFeatureName(stage.islandID)})
              <p className={styles.stageDescription}>{stage.description}</p>
              {stage.shipTransformationDescription && (
                <p className={styles.shipTransformation}><em>Ship: {stage.shipTransformationDescription}</em></p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SeaRouteDisplay;
