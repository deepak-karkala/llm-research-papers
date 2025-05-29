// src/components/ui/Legend.tsx
'use client';

import React, { useState } from 'react';
import styles from './Legend.module.css';

const Legend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true); // Default to open

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className={`${styles.legendToggle} ${styles.legendClosed}`}
        aria-label="Show Legend"
      >
        📜 Legend
      </button>
    );
  }

  return (
    <div className={styles.legendContainer}>
      <button 
        onClick={() => setIsOpen(false)} 
        className={styles.legendToggle}
        aria-label="Hide Legend"
      >
        &times; Close Legend
      </button>
      <h4 className={styles.legendTitle}>Map Legend</h4>
      <ul className={styles.legendList}>
        <li className={styles.legendItem}>
          <img src="/icons/lighthouse.svg" alt="Lighthouse Icon" className={styles.legendIcon} onError={(e) => (e.currentTarget.style.display = 'none')} /> 
          Seminal Paper / Key Concept
        </li>
        <li className={styles.legendItem}>
          <img src="/icons/ship_icon.svg" alt="Ship Icon" className={styles.legendIcon} onError={(e) => (e.currentTarget.style.display = 'none')} /> 
          Foundational Model / Technology
        </li>
        <li className={styles.legendItem}>
          <span className={`${styles.legendColorBox} ${styles.defaultPolygonColor}`}></span>
          Area / Capability (e.g., Continent, Island)
        </li>
         <li className={styles.legendItem}>
          <span className={`${styles.legendColorBox} ${styles.highlightColor}`}></span>
          Highlighted Feature (Focus)
        </li>
        <li className={styles.legendItem}>
            <svg width="20" height="10" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <line x1="0" y1="5" x2="20" y2="5" stroke="coral" strokeWidth="3" strokeDasharray="5, 5" />
            </svg>
            Sea Route Path
        </li>
      </ul>
    </div>
  );
};

export default Legend;
