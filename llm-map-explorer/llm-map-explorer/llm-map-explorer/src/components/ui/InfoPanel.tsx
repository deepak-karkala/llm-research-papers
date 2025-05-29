// src/components/ui/InfoPanel.tsx
'use client';

import React from 'react';
import { MapFeature } from '../../../types/data'; // Adjust path as needed

interface InfoPanelProps {
  feature: MapFeature | null;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ feature, onClose }) => {
  if (!feature) {
    return null;
  }

  // Basic styling - can be expanded with CSS Modules or a styling library
  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '300px',
    maxHeight: '80vh',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000, // Ensure it's above the map
    overflowY: 'auto',
    color: '#333', // Darker text color for readability
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'transparent',
    border: 'none',
    fontSize: '1.5em',
    cursor: 'pointer',
  };

  const titleStyle: React.CSSProperties = {
    marginTop: '0',
    marginBottom: '10px',
    fontSize: '1.4em',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  };

  const detailStyle: React.CSSProperties = {
    marginBottom: '8px',
    fontSize: '0.9em',
  };

  const renderDetails = () => {
    if (!feature.details) return null;
    // Basic check if details might be HTML (e.g. contains <p> or <a>)
    // For MVP, dangerouslySetInnerHTML is used. In a real app, sanitize this.
    if (/[<>]/.test(feature.details) && (feature.type === "landmark_paper" || feature.type === "key_tool")) {
      return <div style={detailStyle} dangerouslySetInnerHTML={{ __html: feature.details }} />;
    }
    return <p style={detailStyle}>{feature.details}</p>;
  };

  return (
    <div style={panelStyle}>
      <button onClick={onClose} style={closeButtonStyle} aria-label="Close panel">&times;</button>
      <h2 style={titleStyle}>{feature.name}</h2>
      <p style={detailStyle}><strong>Type:</strong> {feature.type}</p>
      <p style={detailStyle}><strong>Description:</strong> {feature.description}</p>
      {renderDetails()}
      {feature.parentRegionID && (
        <p style={detailStyle}><strong>Part of:</strong> {feature.parentRegionID}</p>
      )}
      {feature.tags && feature.tags.length > 0 && (
        <p style={detailStyle}><strong>Tags:</strong> {feature.tags.join(', ')}</p>
      )}
      {/* Add more fields as needed, e.g., links, organization, etc. */}
    </div>
  );
};

export default InfoPanel;
