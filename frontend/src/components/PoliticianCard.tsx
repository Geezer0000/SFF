import React from 'react';
import type { Politician } from '../types';
import { getGradeTheme } from '../utils/gradeColors';

interface PoliticianCardProps {
  politician: Politician;
  onClick: () => void;
}

export const PoliticianCard: React.FC<PoliticianCardProps> = ({ politician, onClick }) => {
  const theme = getGradeTheme(politician.overallScore);

  return (
    <div
      onClick={onClick}
      className="card-container"
    >
      {/* Top half */}
      <div className="card-top">
        <div className="card-avatar-wrapper" style={{ borderColor: politician.partyColor || '#e63946' }}>
          <img
            src={politician.photo}
            alt={politician.fullName}
            className="card-avatar-img"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div className="card-info">
          <div className="card-location-badge">
            <span className="card-canton">{politician.cantonName}</span>
            <span className="card-party-tag" style={{ backgroundColor: politician.partyColor || '#333' }}>
              {politician.partyAbbr}
            </span>
          </div>
          <h3 className="card-name">{politician.fullName}</h3>
          <div className="card-title-role">
            <span className="card-role">{politician.council}</span>
          </div>
        </div>
      </div>

      {/* Bottom half: Grade Banner color-coded from Red (1) to Green (6) */}
      <div
        className="card-score-banner"
        style={{
          backgroundColor: theme.bg,
          color: theme.text
        }}
      >
        <div className="card-grade-badge">
          {politician.overallScore !== null ? Number(politician.overallScore).toFixed(1) : '—'}
        </div>
        <div className="card-score-details">
          <div className="card-score-count">
            {politician.council === 'Bundesrat'
              ? 'Bundesrat (Exekutive)'
              : politician.isPresident
              ? 'Ratspräsident (Ungraded)'
              : `${politician.actionsAligned ?? politician.alignedCount} of ${politician.actionsTotal ?? politician.totalVotes} actions aligned`}
          </div>
          <div className="card-score-sub">
            {politician.council === 'Bundesrat'
              ? 'Keine Stimmabgabe im Parlament'
              : politician.isPresident
              ? 'Neutralität gemäss Art. 39 ParlG'
              : 'with ProSchweiz positions'}
          </div>
        </div>
      </div>
    </div>
  );
};
