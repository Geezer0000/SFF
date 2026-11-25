import React, { useState, useMemo } from 'react';
import type { Politician } from '../types';
import { getGradeTheme } from '../utils/gradeColors';

interface ParliamentHemicycleProps {
  politicians: Politician[];
  selectedCouncil?: 'ALL' | 'NR' | 'SR';
  highlightPoliticianId?: string;
  onSelectPolitician?: (p: Politician) => void;
  mini?: boolean;
}

interface SeatPosition {
  x: number;
  y: number;
  angle: number;
  politician: Politician;
}

// Generate concentric arch seat positions
function generateHemicycleSeats(
  members: Politician[],
  nRows: number,
  minRadius: number,
  maxRadius: number,
  cx: number,
  cy: number
): SeatPosition[] {
  if (members.length === 0) return [];
  const nSeats = members.length;
  const radii: number[] = [];
  for (let i = 0; i < nRows; i++) {
    radii.push(minRadius + (i * (maxRadius - minRadius)) / (nRows - 1 || 1));
  }

  const sumR = radii.reduce((acc, r) => acc + r, 0);
  const seatsPerRow = radii.map((r) => Math.round((nSeats * r) / sumR));
  const diff = nSeats - seatsPerRow.reduce((acc, c) => acc + c, 0);
  seatsPerRow[seatsPerRow.length - 1] += diff;

  const rawPositions: { x: number; y: number; angle: number }[] = [];
  seatsPerRow.forEach((count, rowIdx) => {
    const r = radii[rowIdx];
    for (let j = 0; j < count; j++) {
      // angle from Math.PI (180 deg) down to 0
      const angle = Math.PI - ((j + 0.5) * Math.PI) / count;
      const x = cx + r * Math.cos(angle);
      const y = cy - r * Math.sin(angle);
      rawPositions.push({ x, y, angle });
    }
  });

  // Sort raw positions from left to right (angle descending)
  rawPositions.sort((a, b) => b.angle - a.angle);

  return rawPositions.map((pos, idx) => ({
    x: pos.x,
    y: pos.y,
    angle: pos.angle,
    politician: members[idx]
  }));
}

export const ParliamentHemicycle: React.FC<ParliamentHemicycleProps> = ({
  politicians,
  selectedCouncil = 'ALL',
  highlightPoliticianId,
  onSelectPolitician,
  mini = false
}) => {
  const [hoveredSeat, setHoveredSeat] = useState<SeatPosition | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Separate and sort Nationalrat members according to fraction order
  const nrMembers = useMemo(() => {
    const list = politicians.filter((p) => p.council === 'Nationalrat');
    // Order: SVP (4), SP (2), Mitte (3), FDP (1), Grüne (6), GLP (137)
    const groupPriority: Record<number, number> = {
      4: 1, // SVP
      2: 2, // SP
      3: 3, // Mitte
      1: 4, // FDP
      6: 5, // Grüne
      137: 6, // GLP
      99: 7 // Fraktionslos
    };
    return list.sort((a, b) => {
      const gA = groupPriority[a.groupId || 99] || 99;
      const gB = groupPriority[b.groupId || 99] || 99;
      if (gA !== gB) return gA - gB;
      return a.lastName.localeCompare(b.lastName);
    });
  }, [politicians]);

  // Separate and sort Ständerat members according to fraction order
  const srMembers = useMemo(() => {
    const list = politicians.filter((p) => p.council === 'Ständerat');
    // Order: Mitte (3), FDP (1), SP (2), SVP (4), Grüne (6), Fraktionslos (99), GLP (137)
    const groupPriority: Record<number, number> = {
      3: 1, // Mitte
      1: 2, // FDP
      2: 3, // SP
      4: 4, // SVP
      6: 5, // Grüne
      99: 6, // Fraktionslos
      137: 7 // GLP
    };
    return list.sort((a, b) => {
      const gA = groupPriority[a.groupId || 99] || 99;
      const gB = groupPriority[b.groupId || 99] || 99;
      if (gA !== gB) return gA - gB;
      return a.lastName.localeCompare(b.lastName);
    });
  }, [politicians]);

  // Dimensions
  const nrSeats = useMemo(() => {
    return generateHemicycleSeats(nrMembers, 6, mini ? 50 : 85, mini ? 120 : 205, 230, mini ? 135 : 225);
  }, [nrMembers, mini]);

  const srSeats = useMemo(() => {
    return generateHemicycleSeats(srMembers, 3, mini ? 45 : 75, mini ? 100 : 165, 180, mini ? 115 : 185);
  }, [srMembers, mini]);

  // If mini mode for single highlighted politician, determine which chamber to show
  const activeSingleChamber = useMemo(() => {
    if (!highlightPoliticianId) return null;
    const target = politicians.find((p) => p.id === highlightPoliticianId);
    return target?.council === 'Ständerat' ? 'SR' : 'NR';
  }, [highlightPoliticianId, politicians]);

  const handleMouseMove = (e: React.MouseEvent, seat: SeatPosition) => {
    const container = e.currentTarget.closest('.svg-container');
    if (container) {
      const rect = container.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    setHoveredSeat(seat);
  };

  const renderTooltip = () => {
    if (!hoveredSeat) return null;
    const p = hoveredSeat.politician;
    const theme = getGradeTheme(p.overallScore);
    return (
      <div
        className="hemicycle-tooltip"
        style={{
          left: `${mousePos.x + 12}px`,
          top: `${mousePos.y - 45}px`
        }}
      >
        <div className="tooltip-top-row">
          <span
            className="tooltip-party-dot"
            style={{ backgroundColor: p.groupColour || p.partyColor }}
          />
          <span className="tooltip-name">{p.fullName}</span>
          <span className="tooltip-canton">({p.canton})</span>
        </div>
        <div className="tooltip-sub-row">
          <span>{p.council} • {p.groupName || p.partyAbbr}</span>
          {p.overallScore !== null && (
            <span
              className="tooltip-grade-badge"
              style={{ backgroundColor: theme.bg, color: theme.text }}
            >
              Note {p.overallScore.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (mini && activeSingleChamber === 'SR') {
    return (
      <div className="mini-hemicycle-wrapper">
        <svg viewBox="0 0 360 210" className="hemicycle-svg mini-svg">
          {srSeats.map((seat) => {
            const isTarget = seat.politician.id === highlightPoliticianId;
            return (
              <circle
                key={seat.politician.id}
                cx={seat.x}
                cy={seat.y}
                r={isTarget ? 7 : 4}
                fill={seat.politician.groupColour || seat.politician.partyColor || '#666'}
                opacity={isTarget ? 1 : 0.4}
                stroke={isTarget ? '#ffffff' : 'transparent'}
                strokeWidth={isTarget ? 2.5 : 0}
                className={isTarget ? 'highlighted-dot' : ''}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  if (mini) {
    return (
      <div className="mini-hemicycle-wrapper">
        <svg viewBox="0 0 460 250" className="hemicycle-svg mini-svg">
          {nrSeats.map((seat) => {
            const isTarget = seat.politician.id === highlightPoliticianId;
            return (
              <circle
                key={seat.politician.id}
                cx={seat.x}
                cy={seat.y}
                r={isTarget ? 7.5 : 4}
                fill={seat.politician.groupColour || seat.politician.partyColor || '#666'}
                opacity={isTarget ? 1 : 0.4}
                stroke={isTarget ? '#ffffff' : 'transparent'}
                strokeWidth={isTarget ? 2.5 : 0}
                className={isTarget ? 'highlighted-dot' : ''}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  return (
    <div className="hemicycle-container">
      {/* Title & Legend matching screenshot 1 */}
      <div className="hemicycle-header">
        <h2 className="hemicycle-title">Sitze nach Fraktion</h2>
        <p className="hemicycle-subtitle">
          Jeder Punkt ist ein Mitglied, gruppiert nach Fraktion und nach Grösse der Fraktion geordnet.
          Das ist keine Sitzordnung im Saal. <strong>Antippen öffnet das Profil & die Scorecard.</strong>
        </p>
      </div>

      <div className="hemicycle-chambers-grid">
        {/* Nationalrat 200 */}
        {(selectedCouncil === 'ALL' || selectedCouncil === 'NR') && (
          <div className="chamber-card">
            <div className="chamber-title-row">
              <span className="chamber-name">NATIONALRAT 200</span>
              <span className="chamber-seats-badge">200 Sitze</span>
            </div>

            <div className="svg-container" onMouseLeave={() => setHoveredSeat(null)}>
              <svg viewBox="0 0 460 250" className="hemicycle-svg">
                {nrSeats.map((seat) => {
                  const isHovered = hoveredSeat?.politician.id === seat.politician.id;
                  const isTarget = highlightPoliticianId && seat.politician.id === highlightPoliticianId;
                  const color = seat.politician.groupColour || seat.politician.partyColor || '#666';

                  return (
                    <circle
                      key={seat.politician.id}
                      cx={seat.x}
                      cy={seat.y}
                      r={isHovered || isTarget ? 6.5 : 4.4}
                      fill={color}
                      stroke={isHovered || isTarget ? '#ffffff' : '#141518'}
                      strokeWidth={isHovered || isTarget ? 2 : 0.8}
                      className="hemicycle-dot"
                      onMouseEnter={(e) => handleMouseMove(e, seat)}
                      onMouseMove={(e) => handleMouseMove(e, seat)}
                      onClick={() => onSelectPolitician && onSelectPolitician(seat.politician)}
                    />
                  );
                })}
              </svg>
              {hoveredSeat?.politician.council === 'Nationalrat' && renderTooltip()}
            </div>

            {/* Legend for Nationalrat */}
            <div className="hemicycle-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#005e29' }}></span>
                <span className="legend-text">Fraktion der Schweizerischen Volkspartei <strong>67</strong></span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#d0274e' }}></span>
                <span className="legend-text">Sozialdemokratische Fraktion <strong>41</strong></span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#ea7815' }}></span>
                <span className="legend-text">Die Mitte-Fraktion. Die Mitte. EVP. <strong>31</strong></span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#0094eb' }}></span>
                <span className="legend-text">FDP-Liberale Fraktion <strong>27</strong></span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#89ba2c' }}></span>
                <span className="legend-text">Grüne Fraktion <strong>23</strong></span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#8a94a6' }}></span>
                <span className="legend-text">Grünliberale Fraktion <strong>11</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Ständerat 46 */}
        {(selectedCouncil === 'ALL' || selectedCouncil === 'SR') && (
          <div className="chamber-card">
            <div className="chamber-title-row">
              <span className="chamber-name">STÄNDERAT 46</span>
              <span className="chamber-seats-badge">46 Sitze</span>
            </div>

            <div className="svg-container" onMouseLeave={() => setHoveredSeat(null)}>
              <svg viewBox="0 0 360 210" className="hemicycle-svg">
                {srSeats.map((seat) => {
                  const isHovered = hoveredSeat?.politician.id === seat.politician.id;
                  const isTarget = highlightPoliticianId && seat.politician.id === highlightPoliticianId;
                  const color = seat.politician.groupColour || seat.politician.partyColor || '#666';

                  return (
                    <circle
                      key={seat.politician.id}
                      cx={seat.x}
                      cy={seat.y}
                      r={isHovered || isTarget ? 7 : 5}
                      fill={color}
                      stroke={isHovered || isTarget ? '#ffffff' : '#141518'}
                      strokeWidth={isHovered || isTarget ? 2 : 0.8}
                      className="hemicycle-dot"
                      onMouseEnter={(e) => handleMouseMove(e, seat)}
                      onMouseMove={(e) => handleMouseMove(e, seat)}
                      onClick={() => onSelectPolitician && onSelectPolitician(seat.politician)}
                    />
                  );
                })}
              </svg>
              {hoveredSeat?.politician.council === 'Ständerat' && renderTooltip()}
            </div>

            {/* Legend for Ständerat */}
            <div className="hemicycle-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#ea7815' }}></span>
                <span className="legend-text">Die Mitte-Fraktion. Die Mitte. EVP. <strong>15</strong></span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#0094eb' }}></span>
                <span className="legend-text">FDP-Liberale Fraktion <strong>12</strong></span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#d0274e' }}></span>
                <span className="legend-text">Sozialdemokratische Fraktion <strong>7</strong></span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#005e29' }}></span>
                <span className="legend-text">Fraktion der Schweizerischen Volkspartei <strong>7</strong></span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#89ba2c' }}></span>
                <span className="legend-text">Grüne Fraktion <strong>3</strong></span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#d2d22d' }}></span>
                <span className="legend-text">Fraktionslos <strong>1</strong></span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#8a94a6' }}></span>
                <span className="legend-text">Grünliberale Fraktion <strong>1</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
