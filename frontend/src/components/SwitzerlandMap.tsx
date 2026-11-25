import React, { useState } from 'react';
import type { Politician } from '../types';
import mapData from '../data/canton_paths.json';
import { getGradeHexColor } from '../utils/gradeColors';

interface SwitzerlandMapProps {
  politicians: Politician[];
  selectedCanton: string;
  onSelectCanton: (canton: string) => void;
  onSelectPolitician: (politician: Politician) => void;
}

export const SwitzerlandMap: React.FC<SwitzerlandMapProps> = ({
  politicians,
  selectedCanton,
  onSelectCanton,
  onSelectPolitician
}) => {
  const [hoveredCanton, setHoveredCanton] = useState<string | null>(null);

  // Group politicians by canton
  const politiciansByCanton = politicians.reduce((acc, p) => {
    acc[p.canton] = (acc[p.canton] || []).concat(p);
    return acc;
  }, {} as Record<string, Politician[]>);

  // Calculate average grade per canton (Swiss Grade 1.0 - 6.0)
  const cantonAverageGrades: Record<string, number | null> = {};
  for (const [cCode, pList] of Object.entries(politiciansByCanton)) {
    const scoredMembers = pList.filter(p => p.overallScore !== null && typeof p.overallScore === 'number');
    if (scoredMembers.length > 0) {
      const avg = scoredMembers.reduce((sum, p) => sum + (p.overallScore as number), 0) / scoredMembers.length;
      cantonAverageGrades[cCode] = Math.round(avg * 10) / 10;
    } else {
      cantonAverageGrades[cCode] = null;
    }
  }

  const activeCantonCode = selectedCanton || hoveredCanton;
  const activeList = activeCantonCode ? politiciansByCanton[activeCantonCode] || [] : politicians;
  const activeCantonObj = mapData.cantons.find(c => c.code === activeCantonCode);
  const activeCantonName = activeCantonObj ? activeCantonObj.name : 'Alle 26 Kantone';

  return (
    <div className="map-view-container">
      <div className="map-instruction-text">
        Bewege den Mauszeiger über die Schweizer Kantone oder klicke auf einen Kanton, um alle Ständeräte und Nationalräte dieses Standes anzuzeigen.
      </div>

      <div className="map-flex-wrapper">
        {/* SVG Interactive Map of Switzerland with Rock-Solid Fixed Layout (No shift/jump on hover) */}
        <div className="map-svg-container">
          <svg
            viewBox={mapData.viewBox}
            className="swiss-svg-map"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Country Shadow / Base Outline */}
            <path
              d={mapData.countryPath}
              fill="#101114"
              stroke="#2c3038"
              strokeWidth="3"
            />

            {/* 26 Individual Cantons with Real Topographic Borders */}
            {mapData.cantons.map((canton) => {
              const count = (politiciansByCanton[canton.code] || []).length;
              const isSelected = selectedCanton === canton.code;
              const isHovered = hoveredCanton === canton.code;
              const avgGrade = cantonAverageGrades[canton.code];
              const baseFill = avgGrade !== null ? getGradeHexColor(avgGrade) : (count > 0 ? '#1c1e24' : '#141518');

              return (
                <g
                  key={canton.code}
                  className="canton-path-group"
                  onMouseEnter={() => setHoveredCanton(canton.code)}
                  onMouseLeave={() => setHoveredCanton(null)}
                  onClick={() => onSelectCanton(selectedCanton === canton.code ? '' : canton.code)}
                  style={{ cursor: 'pointer' }}
                >
                  <path
                    d={canton.path}
                    className="canton-polygon"
                    style={{
                      fill: baseFill, // Always preserve real grade color, never change to confusing red!
                      stroke: isSelected ? '#00f0ff' : isHovered ? '#ffffff' : '#2c3038',
                      strokeWidth: isSelected ? 2.8 : isHovered ? 2.4 : 1.2,
                      strokeLinejoin: 'round',
                      strokeLinecap: 'round',
                      filter: isSelected
                        ? 'brightness(1.2) drop-shadow(0 0 6px rgba(0, 240, 255, 0.8))'
                        : isHovered
                        ? 'brightness(1.15) drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))'
                        : 'none',
                      transition: 'stroke 0.12s ease, filter 0.12s ease, stroke-width 0.12s ease'
                    }}
                  />
                  {/* Canton Label Abbreviation */}
                  <text
                    x={canton.centerX}
                    y={canton.centerY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="canton-svg-label"
                    style={{
                      fill: isSelected ? '#00f0ff' : '#ffffff',
                      fontSize: isHovered || isSelected ? '12px' : '11px',
                      fontWeight: '800',
                      pointerEvents: 'none',
                      userSelect: 'none',
                      textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                    }}
                  >
                    {canton.code}
                  </text>
                </g>
              );
            })}

            {/* Swiss Lakes for Visual Realism (Bodensee, Genfersee, Vierwaldstättersee etc.) */}
            {mapData.lakes.map((lakePath, idx) => (
              <path
                key={idx}
                d={lakePath}
                fill="#0d1f2d"
                stroke="#1d3557"
                strokeWidth="1"
                style={{ pointerEvents: 'none' }}
              />
            ))}
          </svg>
        </div>

        {/* Canton Members Panel on the Right */}
        <div className="map-sidebar-panel">
          <div className="map-sidebar-header">
            <div>
              <h3>{activeCantonCode ? `${activeCantonName} (${activeCantonCode})` : 'Gesamte Schweiz'}</h3>
              <div className="map-header-badges">
                <span className="map-member-count">
                  {activeList.length} Mitglieder
                </span>
                {activeCantonCode && (
                  <span className="map-canton-score">
                    Durchschnittsnote: {cantonAverageGrades[activeCantonCode] !== null ? cantonAverageGrades[activeCantonCode] : 'Ungraded'}
                  </span>
                )}
              </div>
            </div>
            {selectedCanton && (
              <button
                onClick={() => onSelectCanton('')}
                className="reset-canton-btn"
              >
                Alle anzeigen
              </button>
            )}
          </div>

          <div className="map-politician-list">
            {activeList.length === 0 ? (
              <div className="map-empty-state">
                Keine Parlamentarier für diesen Kanton gefunden.
              </div>
            ) : (
              activeList.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectPolitician(p)}
                  className="map-politician-row"
                >
                  <img
                    src={p.photo}
                    alt={p.fullName}
                    className="map-mini-avatar"
                    style={{ borderColor: p.partyColor }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="map-row-details">
                    <div className="map-row-name">{p.fullName}</div>
                    <div className="map-row-sub">
                      <span className="map-party-badge" style={{ color: p.partyColor }}>
                        {p.partyAbbr}
                      </span>
                      <span>•</span>
                      <span>{p.council}</span>
                      <span>•</span>
                      <span>{p.canton}</span>
                    </div>
                  </div>
                  <div className="map-row-grade">
                    {p.overallScore !== null ? `Note ${p.overallScore}` : 'Ungraded'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
