// src/components/ui/InfoPanel.tsx
'use client';

import React from 'react';
import { MapFeature } from '../../../types/data'; // Adjust path as needed
import styles from './InfoPanel.module.css'; // Import CSS Module

interface InfoPanelProps {
  feature: MapFeature | null;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ feature, onClose }) => {
  if (!feature) {
    return null;
  }

  const renderDetails = () => {
    if (!feature.details) return null;
    // Basic check if details might be HTML (e.g. contains <p> or <a>)
    // For MVP, dangerouslySetInnerHTML is used. In a real app, sanitize this.
    if (/[<>]/.test(feature.details) && (feature.type === "landmark_paper" || feature.type === "key_tool")) {
      return <div className={styles.detailsHtmlContainer} dangerouslySetInnerHTML={{ __html: feature.details }} />;
    }
    return <p className={styles.detail}>{feature.details}</p>;
  };

  return (
    <div className={styles.panel}>
      <button onClick={onClose} className={styles.closeButton} aria-label="Close panel">&times;</button>
      <h2 className={styles.title}>{feature.name}</h2>
      <p className={styles.detail}><strong>Type:</strong> {feature.type}</p>
      <p className={styles.detail}><strong>Description:</strong> {feature.description}</p>
      {renderDetails()}
      {feature.parentRegionID && (
        <p className={styles.detail}><strong>Part of:</strong> {feature.parentRegionID}</p>
      )}
      {feature.tags && feature.tags.length > 0 && (
        <p className={styles.detail}><strong>Tags:</strong> {feature.tags.join(', ')}</p>
      )}
      {/* Add more fields as needed, e.g., links, organization, etc. */}
    </div>
  );
};

export default InfoPanel;
