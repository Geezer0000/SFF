import React, { useState, useEffect } from 'react';
import type { Politician } from '../types';
import { ExternalLink, ArrowLeft, Search, CheckCircle, XCircle, MinusCircle, UserCheck, Vote, Mail } from 'lucide-react';
import { getGradeTheme } from '../utils/gradeColors';
import { ParliamentHemicycle } from './ParliamentHemicycle';

interface DetailViewProps {
  politician: Politician;
  allPoliticians: Politician[];
  onBack: () => void;
  onSelectPolitician: (p: Politician) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  politician,
  allPoliticians,
  onBack,
  onSelectPolitician
}) => {
  const [activeTab, setActiveTab] = useState<'HISTORY' | 'PROFILE'>('HISTORY');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDecision, setFilterDecision] = useState('ALL');
  const [filterSession, setFilterSession] = useState('ALL');
  const theme = getGradeTheme(politician.overallScore);

  // Auto-scroll to top when politician or tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [politician.id, activeTab]);

  const formatDisplayDate = (d?: string | null) => {
    if (!d) return '';
    if (d.includes('-')) {
      const parts = d.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return d;
  };

  const filteredVotes = (politician.recentVotes || []).filter((vote) => {
    const matchesSearch = vote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vote.businessNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vote.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDecision = filterDecision === 'ALL' || vote.politicianPosition === filterDecision;
    const matchesSession = filterSession === 'ALL' || vote.session === filterSession;
    return matchesSearch && matchesDecision && matchesSession;
  });

  // Other members from same canton
  const sameCantonMembers = allPoliticians
    .filter((p) => p.canton === politician.canton && p.id !== politician.id)
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  return (
    <div className="detail-view-container">
      {/* Back button */}
      <div className="detail-nav-bar">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={16} />
          <span>SCORECARD</span>
        </button>
      </div>

      {/* Top Multi-color Score Bar */}
      <div className="detail-status-stripe">
        <div className="stripe-segment stripe-yellow"></div>
        <div className="stripe-segment stripe-green"></div>
        <div className="stripe-segment stripe-red"></div>
        <div className="stripe-segment stripe-green-dark"></div>
      </div>

      {/* Main 2-column layout */}
      <div className="detail-content-grid">
        {/* Left Column: Politician Metadata */}
        <div className="detail-left-col">
          <div className="detail-portrait-container" style={{ borderColor: politician.partyColor || '#e63946' }}>
            <img
              src={politician.photo}
              alt={politician.fullName}
              className="detail-portrait-img"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <h1 className="detail-name">{politician.fullName}</h1>
          <div className="detail-council-title">
            {politician.council} • {politician.cantonName} ({politician.canton})
          </div>

          {/* Score Banner in Detail View color-coded from Red (1) to Green (6) */}
          <div
            className="detail-score-banner"
            style={{
              backgroundColor: theme.bg,
              color: theme.text
            }}
          >
            <div className="detail-grade-num">
              {politician.overallScore !== null ? Number(politician.overallScore).toFixed(1) : '—'}
            </div>
            <div className="detail-grade-info">
              <div className="detail-grade-title">
                {politician.council === 'Bundesrat'
                  ? 'BUNDESRAT (EXEKUTIVE)'
                  : politician.isPresident
                  ? 'RATSPRÄSIDIUM (UNGRADED)'
                  : `SCHWEIZER NOTE ${Number(politician.overallScore).toFixed(1)} / 6.0`}
              </div>
              <div className="detail-grade-desc">
                {politician.council === 'Bundesrat'
                  ? 'Keine Stimmabgabe im Parlament'
                  : politician.isPresident
                  ? 'Als Nationalratspräsident gemäss Art. 39 ParlG neutral (kein Stimmrecht im Rat)'
                  : `${politician.actionsAligned ?? politician.alignedCount} von ${politician.actionsTotal ?? politician.totalVotes} Positionen konform (${(politician.scorePoints ?? 0) > 0 ? `+${politician.scorePoints}` : politician.scorePoints ?? 0} Punkte)`}
              </div>
            </div>
          </div>

          <div className="metadata-table">
            <div className="metadata-row">
              <span className="metadata-label">KANTON</span>
              <span className="metadata-value">{politician.cantonName} ({politician.canton})</span>
            </div>
            <div className="metadata-row">
              <span className="metadata-label">PARTEI</span>
              <span className="metadata-value" style={{ color: politician.partyColor || '#fff' }}>
                {politician.party} ({politician.partyAbbr})
              </span>
            </div>
            {politician.groupName && (
              <div className="metadata-row">
                <span className="metadata-label">FRAKTION</span>
                <span className="metadata-value" style={{ color: politician.groupColour || '#fff' }}>
                  {politician.groupName}
                </span>
              </div>
            )}
            <div className="metadata-row">
              <span className="metadata-label">KAMMER</span>
              <span className="metadata-value">{politician.council}</span>
            </div>
            <div className="metadata-row">
              <span className="metadata-label">SITZ</span>
              <span className="metadata-value">{politician.seat}</span>
            </div>
            <div className="metadata-row">
              <span className="metadata-label">AMTSANTRITT</span>
              <span className="metadata-value">
                {politician.inCouncilSince ? formatDisplayDate(politician.inCouncilSince) : politician.inOfficeSince}
              </span>
            </div>
            <div className="metadata-row">
              <span className="metadata-label">SITZ BIS / WAHLEN</span>
              <span className="metadata-value">{politician.termEnds}</span>
            </div>

            <div className="metadata-divider"></div>
            
            <div className="metadata-row">
              <span className="metadata-label">GEBURTSORT</span>
              <span className="metadata-value">{politician.birthPlace || 'Schweiz'}</span>
            </div>
            {politician.birthYear && (
              <div className="metadata-row">
                <span className="metadata-label">JAHRGANG</span>
                <span className="metadata-value">{politician.birthYear}</span>
              </div>
            )}
            <div className="metadata-row">
              <span className="metadata-label">HEIMATORT</span>
              <span className="metadata-value">{politician.citizenship || politician.cantonName}</span>
            </div>
            <div className="metadata-row">
              <span className="metadata-label">PÄSSE / STAATSBÜRGERSCHAFT</span>
              <span className="metadata-value">
                {politician.passports.map((p, idx) => (
                  <span key={idx} className="passport-pill">
                    🇨🇭 {p}
                  </span>
                ))}
              </span>
            </div>
            <div className="metadata-row">
              <span className="metadata-label">RELIGION / KONFESSION</span>
              <span className="metadata-value">{politician.religion}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Interface (History vs. Official Profile) */}
        <div className="detail-right-col">
          {/* Top Two Tabs */}
          <div className="detail-tabs-header">
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`detail-tab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`}
            >
              <Vote size={16} />
              <span>GESCHÄFTS- & ABSTIMMUNGS-HISTORIE ({politician.recentVotes?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`detail-tab-btn ${activeTab === 'PROFILE' ? 'active' : ''}`}
            >
              <UserCheck size={16} />
              <span>OFFIZIELLES PROFIL (DOSSIER)</span>
            </button>
          </div>

          {/* TAB 1: Voting History & Scoring */}
          {activeTab === 'HISTORY' && (
            <div className="tab-pane-history">
              <div className="bills-header-row">
                <h2 className="bills-header-title">
                  ABSTIMMUNGSERGEBNISSE & POSITIONEN
                </h2>
                <span className="bills-note-link">Offizielle Bundesdaten (Curia Vista)</span>
              </div>

              {/* Search and Filters inside detail view */}
              <div className="bills-filter-bar">
                <div className="bills-search-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Gesetze oder Geschäftsnummer suchen..."
                    className="bills-search-input"
                  />
                </div>

                <div className="bills-filter-dropdowns">
                  <div className="select-wrapper">
                    <select
                      value={filterSession}
                      onChange={(e) => setFilterSession(e.target.value)}
                      className="filter-select"
                    >
                      <option value="ALL">Alle Sessionen ({politician.recentVotes?.length || 0} Geschäfte)</option>
                      <option value="Herbstsession 2026">Herbstsession 2026 (7)</option>
                      <option value="Sommersession 2026">Sommersession 2026 (8)</option>
                      <option value="Frühjahrssession 2026">Frühjahrssession 2026 (4)</option>
                    </select>
                  </div>

                  <div className="select-wrapper">
                    <select
                      value={filterDecision}
                      onChange={(e) => setFilterDecision(e.target.value)}
                      className="filter-select"
                    >
                      <option value="ALL">Alle Positionen</option>
                      <option value="Ja">Stimmte Ja</option>
                      <option value="Nein">Stimmte Nein</option>
                      <option value="Hat nicht teilgenommen">Abwesend / Nicht teilgenommen</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bills List */}
              <div className="bills-list">
                {filteredVotes.length === 0 ? (
                  <div className="no-bills-message">
                    Keine Geschäfte für diese Filterkriterien gefunden.
                  </div>
                ) : (
                  filteredVotes.map((bill) => (
                    <div key={bill.id} className="bill-card">
                      <div className="bill-card-main">
                        <div className="bill-meta-line">
                          <span className="bill-number">{bill.businessNumber}</span>
                          <span className="bill-bullet">•</span>
                          <span className="bill-date">{formatDisplayDate(bill.date)}</span>
                          {bill.session && (
                            <>
                              <span className="bill-bullet">•</span>
                              <span className="bill-session-badge">{bill.session}</span>
                            </>
                          )}
                        </div>

                        <h3 className="bill-title">{bill.title}</h3>

                        <p className="bill-summary">{bill.summary}</p>

                        <div className="bill-links">
                          <a
                            href={bill.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="curia-link"
                          >
                            <span>Curia Vista Parlaments-Dossier öffnen</span>
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>

                      {/* Right side of bill card: ProSchweiz alignment & Politician vote */}
                      <div className="bill-card-voting">
                        <div className="bill-vote-row">
                          <span className="vote-label">PROSCHWEIZ:</span>
                          <span className={`vote-target-badge ${bill.targetPosition === 'Ja' ? 'target-yes' : bill.targetPosition === 'Nein' ? 'target-no' : 'target-neutral'}`}>
                            Position: {bill.targetPosition || 'Ungraded'}
                          </span>
                        </div>
                        <div className="bill-vote-row">
                          <span className="vote-label">{politician.lastName}:</span>
                          <span className={`vote-badge-politician ${bill.politicianPosition === 'Ja' ? 'vote-yes' : bill.politicianPosition === 'Nein' ? 'vote-no' : 'vote-absent'}`}>
                            {bill.politicianPosition === 'Ja' && <CheckCircle size={14} />}
                            {bill.politicianPosition === 'Nein' && <XCircle size={14} />}
                            {bill.politicianPosition !== 'Ja' && bill.politicianPosition !== 'Nein' && <MinusCircle size={14} />}
                            <span>
                              {politician.council === 'Bundesrat'
                                ? 'Bundesrat (Exekutive)'
                                : politician.isPresident || bill.alignment === 'President'
                                ? 'Ratspräsidium (Art. 39 ParlG: stimmt nicht)'
                                : `Stimmte: ${bill.politicianPosition}`}
                            </span>
                          </span>
                        </div>

                        <div className="bill-alignment-box">
                          {bill.alignment === 'Aligned' && (
                            <span className="alignment-badge-aligned">
                              +5 Punkte • ProSchweiz-konform
                            </span>
                          )}
                          {bill.alignment === 'Opposed' && (
                            <span className="alignment-badge-opposed">
                              -5 Punkte • Gegen ProSchweiz
                            </span>
                          )}
                          {bill.alignment === 'Abstained' && (
                            <span className="alignment-badge-abstained">
                              -1 Punkt • Enthaltung / Abwesend
                            </span>
                          )}
                          {bill.alignment === 'President' && (
                            <span className="alignment-badge-president">
                              Ratspräsidium • Neutralität gemäss Art. 39 ParlG (0 Pkt)
                            </span>
                          )}
                          {bill.alignment === 'Executive' && (
                            <span className="alignment-badge-neutral">
                              Exekutive • Kein Stimmrecht
                            </span>
                          )}
                          {!bill.alignment && (
                            <span className="alignment-badge-neutral">
                              Ungraded
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Official Profile (Swiss Living Index Dossier Reproduction) */}
          {activeTab === 'PROFILE' && (
            <div className="tab-pane-profile">
              {/* Profile Bio Header Card */}
              <div className="dossier-hero-card">
                <div
                  className="dossier-avatar-initials"
                  style={{ backgroundColor: politician.groupColour || politician.partyColor || '#d90429' }}
                >
                  {politician.firstName[0]}{politician.lastName[0]}
                </div>
                <div className="dossier-hero-info">
                  <h2 className="dossier-name">{politician.fullName}</h2>
                  <p className="dossier-lead">
                    {politician.fullName} ist {politician.council === 'Nationalrat' ? 'Nationalrätin / Nationalrat' : politician.council === 'Ständerat' ? 'Ständerätin / Ständerat' : 'Mitglied des Bundesrates'} für den Kanton <strong>{politician.cantonName}</strong> ({politician.partyAbbr}{politician.groupName ? `, ${politician.groupName}` : ''}), in diesem Rat seit <strong>{politician.inCouncilSince ? formatDisplayDate(politician.inCouncilSince) : politician.inOfficeSince}</strong>. {politician.birthYear ? `Jahrgang ${politician.birthYear}, ` : ''}Geburtsort <strong>{politician.birthPlace || 'Schweiz'}</strong>.
                  </p>
                </div>
              </div>

              {/* 4 Core Facts Grid */}
              <div className="dossier-facts-grid">
                <div className="dossier-fact-card">
                  <span className="fact-label">RAT</span>
                  <span className="fact-value">{politician.council}</span>
                </div>
                <div className="dossier-fact-card">
                  <span className="fact-label">KANTON</span>
                  <span className="fact-value">{politician.cantonName} ({politician.canton})</span>
                </div>
                <div className="dossier-fact-card">
                  <span className="fact-label">PARTEI</span>
                  <span className="fact-value" style={{ color: politician.partyColor || '#fff' }}>
                    {politician.partyAbbr}
                  </span>
                </div>
                <div className="dossier-fact-card">
                  <span className="fact-label">SITZ NR.</span>
                  <span className="fact-value">
                    {politician.seatNumber || (politician.seat ? politician.seat.replace(/[^0-9]/g, '') : '—')}
                  </span>
                </div>
              </div>

              {/* Contact & Profiles */}
              <div className="dossier-section-card">
                <h3 className="dossier-section-title">Kontakt und Profile</h3>
                <div className="dossier-contact-list">
                  <div className="contact-item">
                    <Mail size={15} className="contact-icon" />
                    <span>E-Mail: </span>
                    <a href={`mailto:${politician.email || 'info@parl.ch'}`} className="dossier-link">
                      {politician.email || `${politician.firstName.toLowerCase()}.${politician.lastName.toLowerCase()}@parl.ch`}
                    </a>
                  </div>
                  <div className="contact-item">
                    <ExternalLink size={15} className="contact-icon" />
                    <a
                      href={politician.parliamentProfileUrl || `https://www.parlament.ch/de/biografie?CouncillorId=${politician.personNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dossier-link font-bold"
                    >
                      Offizielles Profil auf parlament.ch (Curia Vista) öffnen
                    </a>
                  </div>
                </div>
              </div>

              {/* Parliamentary Career */}
              <div className="dossier-section-card">
                <h3 className="dossier-section-title">Laufbahn im Parlament</h3>
                <table className="dossier-table">
                  <thead>
                    <tr>
                      <th>RAT</th>
                      <th>VON</th>
                      <th>BIS</th>
                      <th>PARTEI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(politician.career && politician.career.length > 0) ? (
                      politician.career.map((c, idx) => (
                        <tr key={idx}>
                          <td className="font-bold">{c.council === 'NR' ? 'Nationalrat' : c.council === 'SR' ? 'Ständerat' : c.council}</td>
                          <td>{formatDisplayDate(c.from)}</td>
                          <td>{c.to ? formatDisplayDate(c.to) : 'heute'}</td>
                          <td>{(c.parties || []).join(', ') || politician.partyAbbr}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="font-bold">{politician.council}</td>
                        <td>{politician.inCouncilSince ? formatDisplayDate(politician.inCouncilSince) : politician.inOfficeSince}</td>
                        <td>heute</td>
                        <td>{politician.partyAbbr}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Occupations */}
              <div className="dossier-section-card">
                <h3 className="dossier-section-title">Beruf und Tätigkeiten</h3>
                {politician.occupations && politician.occupations.length > 0 ? (
                  <table className="dossier-table">
                    <thead>
                      <tr>
                        <th>BERUF</th>
                        <th>ARBEITGEBER</th>
                        <th>SEIT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {politician.occupations.map((occ, idx) => (
                        <tr key={idx}>
                          <td className="font-bold">{occ.occupation}</td>
                          <td>{occ.employer || '—'}</td>
                          <td>{occ.since || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="dossier-empty-note">
                    Berufsmandat: Parlamentarier/in • Keine weiteren externen Arbeitgeber im Parlamentsregister erfasst.
                  </p>
                )}
              </div>

              {/* Committees & Delegations */}
              <div className="dossier-section-card">
                <h3 className="dossier-section-title">Kommissionen und Delegationen</h3>
                {politician.committees && politician.committees.length > 0 ? (
                  <table className="dossier-table">
                    <thead>
                      <tr>
                        <th>KOMMISSION</th>
                        <th>FUNKTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {politician.committees.map((com, idx) => (
                        <tr key={idx}>
                          <td className="font-bold">{com.name}</td>
                          <td>
                            <span className="function-badge">{com.function}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="dossier-empty-note">
                    Keine ständigen Kommissionssitze im Parlamentsregister hinterlegt.
                  </p>
                )}
              </div>

              {/* Interests & Conflicts (Art. 11 ParlG) */}
              <div className="dossier-section-card">
                <div className="section-title-with-badge">
                  <h3 className="dossier-section-title">Interessenbindungen</h3>
                  <span className="interests-count-badge">
                    {politician.interests?.length || 0} gemeldet (Art. 11 ParlG)
                  </span>
                </div>
                <p className="interests-explainer">
                  Wie im offiziellen Register der Interessenbindungen der Parlamentsdienste deklariert.
                </p>

                {politician.interests && politician.interests.length > 0 ? (
                  <table className="dossier-table">
                    <thead>
                      <tr>
                        <th>ORGANISATION</th>
                        <th>RECHTSFORM</th>
                        <th>GREMIUM</th>
                        <th>FUNKTION</th>
                        <th>BEZAHLT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {politician.interests.map((int, idx) => (
                        <tr key={idx}>
                          <td className="font-bold">{int.organisation}</td>
                          <td>{int.legal_form || '—'}</td>
                          <td>{int.body || 'k. A.'}</td>
                          <td>{int.function}</td>
                          <td>
                            <span className={`paid-pill ${int.paid ? 'paid-yes' : 'paid-no'}`}>
                              {int.paid ? 'ja' : 'nein'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="dossier-empty-note">
                    Keine bezahlten oder unbezahlten Interessenbindungen gemäss Art. 11 ParlG gemeldet.
                  </p>
                )}
              </div>

              {/* Voting Discipline & Attendance */}
              {politician.votingRecord && (
                <div className="dossier-section-card">
                  <h3 className="dossier-section-title">
                    Abstimmungsverhalten & Fraktionsdisziplin (52. Legislatur)
                  </h3>
                  <p className="voting-stat-text">
                    <strong>{politician.votingRecord.votes.toLocaleString('de-CH')}</strong> Abstimmungen von{' '}
                    {formatDisplayDate(politician.votingRecord.from)} bis {formatDisplayDate(politician.votingRecord.to)}; an{' '}
                    <strong>{politician.votingRecord.participation_pct.toFixed(1)} %</strong> davon hat das Mitglied teilgenommen
                    (Ja, Nein oder Enthaltung; ohne Abstimmungen, die es als Ratspräsident/in leitete).
                  </p>
                  <p className="voting-stat-text">
                    Bei <strong>{politician.votingRecord.group_agreement_pct.toFixed(1)} %</strong> der eigenen{' '}
                    {politician.votingRecord.group_agreement_base.toLocaleString('de-CH')} Ja- und Nein-Stimmen gleich wie die Mehrheit der eigenen Fraktion.
                  </p>
                  <p className="voting-stat-text">
                    Entschuldigt (Art. 57 Abs. 4 Parlamentsgesetz) bei <strong>{politician.votingRecord.excused}</strong> Abstimmungen.
                  </p>

                  <div className="voting-metrics-row">
                    <div className="metric-box">
                      <span className="metric-num">{politician.votingRecord.participation_pct.toFixed(1)} %</span>
                      <span className="metric-label">Teilnahmequote</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-num text-gold">{politician.votingRecord.group_agreement_pct.toFixed(1)} %</span>
                      <span className="metric-label">Fraktionstreue</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-num">{politician.votingRecord.votes.toLocaleString('de-CH')}</span>
                      <span className="metric-label">Elektronische Voten</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-num text-green">{politician.votingRecord.excused}</span>
                      <span className="metric-label">Entschuldigt</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Hemicycle Position in Chamber */}
              {politician.council !== 'Bundesrat' && (
                <div className="dossier-section-card">
                  <div className="section-title-with-badge">
                    <h3 className="dossier-section-title">{politician.groupName || 'Fraktion'} im Ratssaal</h3>
                    <span className="seat-badge-highlight">
                      Hervorgehobener Sitz: {politician.seat}
                    </span>
                  </div>
                  <p className="interests-explainer">
                    Position in der Fraktion ({politician.council} • Sitze nach Fraktion gruppiert, keine Sitzordnung im Saal).
                  </p>
                  <div className="detail-hemicycle-container">
                    <ParliamentHemicycle
                      politicians={allPoliticians}
                      highlightPoliticianId={politician.id}
                      mini={true}
                    />
                  </div>
                </div>
              )}

              {/* Other Members from same Canton */}
              {sameCantonMembers.length > 0 && (
                <div className="dossier-section-card">
                  <h3 className="dossier-section-title">
                    Weitere Mitglieder der Bundesversammlung aus dem Kanton {politician.cantonName} ({sameCantonMembers.length})
                  </h3>
                  <div className="canton-members-grid">
                    {sameCantonMembers.map((other) => {
                      const otherTheme = getGradeTheme(other.overallScore);
                      return (
                        <div
                          key={other.id}
                          className="canton-member-pill-card"
                          onClick={() => onSelectPolitician(other)}
                        >
                          <span
                            className="member-party-badge"
                            style={{ backgroundColor: other.partyColor || '#444' }}
                          >
                            {other.partyAbbr}
                          </span>
                          <span className="member-name">{other.fullName}</span>
                          <span className="member-council-tag">{other.council}</span>
                          {other.overallScore !== null && (
                            <span
                              className="member-score-tag"
                              style={{ backgroundColor: otherTheme.bg, color: otherTheme.text }}
                            >
                              {other.overallScore.toFixed(1)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
