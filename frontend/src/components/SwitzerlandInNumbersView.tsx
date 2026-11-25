import React, { useState, useMemo, useEffect } from 'react';
import { Users, Landmark, DollarSign, Briefcase, Globe, ArrowUpRight } from 'lucide-react';
import type { Politician } from '../types';
import { getGradeTheme } from '../utils/gradeColors';
import { ParliamentHemicycle } from './ParliamentHemicycle';

interface SwitzerlandInNumbersViewProps {
  politicians: Politician[];
  onSelectPolitician: (politician: Politician) => void;
  onGoToScorecard: () => void;
}

interface MigrationRecord {
  country: string;
  inflow: number;
  outflow: number;
  net: number;
}

interface CantonStat {
  code: string;
  name: string;
  capital: string;
  population: number;
  foreignersPct: number;
  tax100k: number;
  unemploymentPct: number;
}

const CANTON_STATS: CantonStat[] = [
  { code: 'ZH', name: 'Zürich', capital: 'Zürich', population: 1605500, foreignersPct: 28.1, tax100k: 12450, unemploymentPct: 2.8 },
  { code: 'BE', name: 'Bern', capital: 'Bern', population: 1058200, foreignersPct: 17.5, tax100k: 16820, unemploymentPct: 2.5 },
  { code: 'LU', name: 'Luzern', capital: 'Luzern', population: 431000, foreignersPct: 19.8, tax100k: 13910, unemploymentPct: 2.2 },
  { code: 'UR', name: 'Uri', capital: 'Altdorf', population: 37700, foreignersPct: 13.9, tax100k: 12850, unemploymentPct: 1.4 },
  { code: 'SZ', name: 'Schwyz', capital: 'Schwyz', population: 167300, foreignersPct: 23.0, tax100k: 9240, unemploymentPct: 1.6 },
  { code: 'OW', name: 'Obwalden', capital: 'Sarnen', population: 39000, foreignersPct: 16.2, tax100k: 11100, unemploymentPct: 1.3 },
  { code: 'NW', name: 'Nidwalden', capital: 'Stans', population: 44600, foreignersPct: 16.0, tax100k: 9850, unemploymentPct: 1.5 },
  { code: 'GL', name: 'Glarus', capital: 'Glarus', population: 41900, foreignersPct: 25.1, tax100k: 14780, unemploymentPct: 2.4 },
  { code: 'ZG', name: 'Zug', capital: 'Zug', population: 132600, foreignersPct: 30.2, tax100k: 5321, unemploymentPct: 2.6 },
  { code: 'FR', name: 'Freiburg', capital: 'Freiburg', population: 341500, foreignersPct: 24.3, tax100k: 15980, unemploymentPct: 3.3 },
  { code: 'SO', name: 'Solothurn', capital: 'Solothurn', population: 286200, foreignersPct: 24.2, tax100k: 15620, unemploymentPct: 3.1 },
  { code: 'BS', name: 'Basel-Stadt', capital: 'Basel', population: 206800, foreignersPct: 37.8, tax100k: 17450, unemploymentPct: 4.1 },
  { code: 'BL', name: 'Basel-Landschaft', capital: 'Liestal', population: 297500, foreignersPct: 24.0, tax100k: 16540, unemploymentPct: 2.9 },
  { code: 'SH', name: 'Schaffhausen', capital: 'Schaffhausen', population: 86400, foreignersPct: 27.4, tax100k: 14210, unemploymentPct: 3.2 },
  { code: 'AR', name: 'Appenzell Ausserrhoden', capital: 'Herisau', population: 56100, foreignersPct: 17.6, tax100k: 14100, unemploymentPct: 1.9 },
  { code: 'AI', name: 'Appenzell Innerrhoden', capital: 'Appenzell', population: 16500, foreignersPct: 12.1, tax100k: 10450, unemploymentPct: 0.9 },
  { code: 'SG', name: 'St. Gallen', capital: 'St. Gallen', population: 532000, foreignersPct: 25.8, tax100k: 14620, unemploymentPct: 2.6 },
  { code: 'GR', name: 'Graubünden', capital: 'Chur', population: 204300, foreignersPct: 20.4, tax100k: 12890, unemploymentPct: 1.8 },
  { code: 'AG', name: 'Aargau', capital: 'Aarau', population: 726800, foreignersPct: 26.5, tax100k: 13780, unemploymentPct: 3.2 },
  { code: 'TG', name: 'Thurgau', capital: 'Frauenfeld', population: 292800, foreignersPct: 26.2, tax100k: 13950, unemploymentPct: 2.7 },
  { code: 'TI', name: 'Tessin', capital: 'Bellinzona', population: 357100, foreignersPct: 28.6, tax100k: 14920, unemploymentPct: 3.5 },
  { code: 'VD', name: 'Waadt', capital: 'Lausanne', population: 843600, foreignersPct: 34.1, tax100k: 17210, unemploymentPct: 4.3 },
  { code: 'VS', name: 'Wallis', capital: 'Sitten', population: 362400, foreignersPct: 24.4, tax100k: 14450, unemploymentPct: 3.6 },
  { code: 'NE', name: 'Neuenburg', capital: 'Neuenburg', population: 177400, foreignersPct: 26.3, tax100k: 18071, unemploymentPct: 4.6 },
  { code: 'GE', name: 'Genf', capital: 'Genf', population: 520200, foreignersPct: 41.5, tax100k: 16890, unemploymentPct: 5.1 },
  { code: 'JU', name: 'Jura', capital: 'Delsberg', population: 74200, foreignersPct: 16.5, tax100k: 17920, unemploymentPct: 4.5 }
];

const MIGRATION_DATA: MigrationRecord[] = [
  { country: 'Deutschland', inflow: 26434, outflow: 11978, net: 14456 },
  { country: 'Frankreich', inflow: 20696, outflow: 9846, net: 10850 },
  { country: 'Italien', inflow: 18587, outflow: 10596, net: 7991 },
  { country: 'Spanien', inflow: 11402, outflow: 5217, net: 6185 },
  { country: 'Portugal', inflow: 11420, outflow: 10601, net: 819 },
  { country: 'Ukraine', inflow: 9015, outflow: 2211, net: 6804 },
  { country: 'Rumänien', inflow: 6787, outflow: 3928, net: 2859 },
  { country: 'Kosovo', inflow: 6420, outflow: 2910, net: 3510 },
  { country: 'Nordmazedonien', inflow: 4820, outflow: 2110, net: 2710 },
  { country: 'Türkei', inflow: 4610, outflow: 1890, net: 2720 },
  { country: 'Grossbritannien', inflow: 4350, outflow: 3980, net: 370 },
  { country: 'Polen', inflow: 4120, outflow: 2810, net: 1310 },
  { country: 'Österreich', inflow: 3950, outflow: 2980, net: 970 },
  { country: 'Syrien', inflow: 3610, outflow: 420, net: 3190 },
  { country: 'Afghanistan', inflow: 3280, outflow: 310, net: 2970 },
  { country: 'Eritrea', inflow: 2890, outflow: 280, net: 2610 }
];

const HISTORICAL_IMMIGRATION = [
  { year: 2011, count: 164612 },
  { year: 2012, count: 175008 },
  { year: 2013, count: 193302 },
  { year: 2014, count: 187326 },
  { year: 2015, count: 188515 },
  { year: 2016, count: 191683 },
  { year: 2017, count: 170945 },
  { year: 2018, count: 170006 },
  { year: 2019, count: 169573 },
  { year: 2020, count: 163180 },
  { year: 2021, count: 165640 },
  { year: 2022, count: 190083 },
  { year: 2023, count: 263081 },
  { year: 2024, count: 212578 },
  { year: 2025, count: 204261 }
];

export const SwitzerlandInNumbersView: React.FC<SwitzerlandInNumbersViewProps> = ({
  politicians,
  onSelectPolitician,
  onGoToScorecard
}) => {
  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'PARLAMENT' | 'BEVOELKERUNG' | 'BUNDESRAT' | 'KANTONE'>('OVERVIEW');
  const [cantonSearch, setCantonSearch] = useState('');
  const [cantonSortCol, setCantonSortCol] = useState<'name' | 'population' | 'foreignersPct' | 'tax100k' | 'unemploymentPct' | 'grade'>('population');
  const [cantonSortAsc, setCantonSortAsc] = useState(false);

  // Auto-scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeSection]);

  // Filter federal council members from politicians
  const federalCouncil = useMemo(() => {
    return politicians.filter(p => p.council === 'Bundesrat');
  }, [politicians]);

  // Compute average score per canton from politicians data
  const cantonGrades = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};
    politicians.forEach(p => {
      if (p.overallScore !== null && !isNaN(p.overallScore) && p.council !== 'Bundesrat' && !p.isPresident) {
        if (!map[p.canton]) {
          map[p.canton] = { sum: 0, count: 0 };
        }
        map[p.canton].sum += p.overallScore;
        map[p.canton].count += 1;
      }
    });

    const res: Record<string, number | null> = {};
    Object.keys(map).forEach(c => {
      res[c] = map[c].count > 0 ? parseFloat((map[c].sum / map[c].count).toFixed(2)) : null;
    });
    return res;
  }, [politicians]);

  // Sorted cantons table
  const sortedCantons = useMemo(() => {
    const filtered = CANTON_STATS.filter(c => 
      c.name.toLowerCase().includes(cantonSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(cantonSearch.toLowerCase()) ||
      c.capital.toLowerCase().includes(cantonSearch.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (cantonSortCol === 'name') {
        valA = a.name;
        valB = b.name;
        return cantonSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (cantonSortCol === 'grade') {
        valA = cantonGrades[a.code] ?? 0;
        valB = cantonGrades[b.code] ?? 0;
      } else {
        valA = a[cantonSortCol];
        valB = b[cantonSortCol];
      }

      return cantonSortAsc ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
    });
  }, [cantonSearch, cantonSortCol, cantonSortAsc, cantonGrades]);

  const maxHistorical = Math.max(...HISTORICAL_IMMIGRATION.map(h => h.count));

  return (
    <div className="zahlen-view-container">
      {/* Top Breadcrumb & Hero */}
      <div className="zahlen-hero-section">
        <div className="zahlen-badge-row">
          <span className="zahlen-ch-flag">🇨🇭</span>
          <span className="zahlen-hero-pill">OFFIZIELLE BUNDESSTATISTIKEN · BFS / SECO / ESTV / EFV</span>
        </div>
        <h1 className="zahlen-hero-title">DIE SCHWEIZ IN ZAHLEN</h1>
        <p className="zahlen-hero-lead">
          Die Schweiz zählt <strong>9’127’125</strong> Einwohnerinnen und Einwohner (2025), <strong>27,7 %</strong> davon ohne Schweizer Pass. 
          Sie ist ein Bundesstaat mit <strong>26 Kantonen</strong> und <strong>2’108 Gemeinden</strong>; regiert wird sie vom siebenköpfigen Bundesrat, 
          Bundesstadt ist Bern. Hier stehen die wichtigsten amtlichen Kennzahlen für das gesamte Land, kombiniert mit dem ProSchweiz Souveränitäts-Rating.
        </p>

        {/* 6 Core KPI Grid (Matching Swiss Living Index Hero) */}
        <div className="zahlen-kpi-grid">
          <div className="zahlen-kpi-card">
            <div className="kpi-label-row">
              <span className="kpi-label">BEVÖLKERUNG</span>
              <Users size={16} className="kpi-icon" />
            </div>
            <div className="kpi-value">9’127’125</div>
            <div className="kpi-source">2025 · Bundesamt für Statistik (BFS)</div>
          </div>

          <div className="zahlen-kpi-card">
            <div className="kpi-label-row">
              <span className="kpi-label">AUSLÄNDERANTEIL</span>
              <Globe size={16} className="kpi-icon highlight-red" />
            </div>
            <div className="kpi-value text-red">27,7 %</div>
            <div className="kpi-source">2’528’213 Personen ohne CH-Pass</div>
          </div>

          <div className="zahlen-kpi-card">
            <div className="kpi-label-row">
              <span className="kpi-label">KANTONE & STÄNDE</span>
              <Landmark size={16} className="kpi-icon" />
            </div>
            <div className="kpi-value">26</div>
            <div className="kpi-source">20 Vollkantone, 6 Halbkantone</div>
          </div>

          <div className="zahlen-kpi-card">
            <div className="kpi-label-row">
              <span className="kpi-label">GEMEINDEN</span>
              <span className="kpi-icon">🏛️</span>
            </div>
            <div className="kpi-value">2’108</div>
            <div className="kpi-source">Stand 2026 (BFS Gemeindeverzeichnis)</div>
          </div>

          <div className="zahlen-kpi-card">
            <div className="kpi-label-row">
              <span className="kpi-label">ARBEITSLOSENQUOTE</span>
              <Briefcase size={16} className="kpi-icon" />
            </div>
            <div className="kpi-value">3,0 %</div>
            <div className="kpi-source">Oktober 2026 · SECO (142'810 Personen)</div>
          </div>

          <div className="zahlen-kpi-card">
            <div className="kpi-label-row">
              <span className="kpi-label">MEDIANLOHN (BRUTTO)</span>
              <DollarSign size={16} className="kpi-icon highlight-gold" />
            </div>
            <div className="kpi-value text-gold">CHF 7’024</div>
            <div className="kpi-source">pro Monat · BFS Lohnstrukturerhebung</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="zahlen-nav-bar">
        <button
          onClick={() => setActiveSection('OVERVIEW')}
          className={`zahlen-nav-btn ${activeSection === 'OVERVIEW' ? 'active' : ''}`}
        >
          ÜBERSICHT & TAX-RADAR
        </button>
        <button
          onClick={() => setActiveSection('PARLAMENT')}
          className={`zahlen-nav-btn ${activeSection === 'PARLAMENT' ? 'active' : ''}`}
        >
          SITZE NACH FRAKTION (200 + 46)
        </button>
        <button
          onClick={() => setActiveSection('BEVOELKERUNG')}
          className={`zahlen-nav-btn ${activeSection === 'BEVOELKERUNG' ? 'active' : ''}`}
        >
          BEVÖLKERUNG & MIGRATION 2025
        </button>
        <button
          onClick={() => setActiveSection('BUNDESRAT')}
          className={`zahlen-nav-btn ${activeSection === 'BUNDESRAT' ? 'active' : ''}`}
        >
          DER BUND: BUNDESRAT (7)
        </button>
        <button
          onClick={() => setActiveSection('KANTONE')}
          className={`zahlen-nav-btn ${activeSection === 'KANTONE' ? 'active' : ''}`}
        >
          KANTONE IM VERGLEICH (26)
        </button>
      </div>

      {/* Section: Sitze nach Fraktion (Hemicycle) */}
      {activeSection === 'PARLAMENT' && (
        <div className="zahlen-section">
          <ParliamentHemicycle
            politicians={politicians}
            onSelectPolitician={onSelectPolitician}
          />
        </div>
      )}

      {/* Section 1: Overview & Tax Radar */}
      {activeSection === 'OVERVIEW' && (
        <div className="zahlen-section">
          <div className="zahlen-split-grid">
            <div className="zahlen-card-box">
              <h2 className="zahlen-box-title">Einkommenssteuer pro Jahr (ledig, CHF 100’000)</h2>
              <p className="zahlen-box-desc">
                Die Steuerbelastung für eine alleinstehende Person ohne Kinder mit einem steuerbaren Jahreseinkommen von CHF 100’000 
                variiert drastisch je nach Wohnkanton (Quelle: Eidgenössische Steuerverwaltung ESTV 2025/2026).
              </p>

              <div className="tax-spread-bar">
                <div className="tax-spread-min">
                  <span className="tax-canton-tag">Zug (ZG)</span>
                  <span className="tax-amount-min">CHF 5’321</span>
                  <span className="tax-subtext">Geringste Steuerlast</span>
                </div>
                <div className="tax-spread-divider">
                  <span className="tax-diff-label">Faktor 3.4x Unterschied</span>
                </div>
                <div className="tax-spread-max">
                  <span className="tax-canton-tag tag-high">Neuenburg (NE)</span>
                  <span className="tax-amount-max">CHF 18’071</span>
                  <span className="tax-subtext">Höchste Steuerlast</span>
                </div>
              </div>

              <div className="tax-ranking-preview">
                <div className="preview-group">
                  <h4>Günstigste Steuerkantone:</h4>
                  <ul>
                    <li>1. Zug (ZG): <strong>CHF 5’321</strong></li>
                    <li>2. Schwyz (SZ): <strong>CHF 9’240</strong></li>
                    <li>3. Nidwalden (NW): <strong>CHF 9’850</strong></li>
                    <li>4. Appenzell I.Rh. (AI): <strong>CHF 10’450</strong></li>
                    <li>5. Obwalden (OW): <strong>CHF 11’100</strong></li>
                  </ul>
                </div>
                <div className="preview-group">
                  <h4>Teuerste Steuerkantone:</h4>
                  <ul>
                    <li>26. Neuenburg (NE): <strong>CHF 18’071</strong></li>
                    <li>25. Jura (JU): <strong>CHF 17’920</strong></li>
                    <li>24. Basel-Stadt (BS): <strong>CHF 17’450</strong></li>
                    <li>23. Waadt (VD): <strong>CHF 17’210</strong></li>
                    <li>22. Genf (GE): <strong>CHF 16’890</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="zahlen-card-box">
              <h2 className="zahlen-box-title">Staatsaufbau & Souveränität</h2>
              <p className="zahlen-box-desc">
                Die Schweizerische Eidgenossenschaft basiert auf dem Prinzip der Subsidiarität, des Föderalismus und der direkten Demokratie. 
                Jede Aufgabe, die nicht ausdrücklich der Bundesverfassung übertragen ist, verbleibt bei den Kantonen.
              </p>
              
              <div className="souveraenitaet-stats-list">
                <div className="stat-row">
                  <span className="stat-title">Stimmberechtigte Bürger:</span>
                  <span className="stat-value">ca. 5’610’000</span>
                </div>
                <div className="stat-row">
                  <span className="stat-title">Auslandschweizer («Fünfte Schweiz»):</span>
                  <span className="stat-value">813’400 (davon 227’000 im Stimmregister)</span>
                </div>
                <div className="stat-row">
                  <span className="stat-title">Nationalrat (Volksvertretung):</span>
                  <span className="stat-value">200 Sitze (Proporzwahl)</span>
                </div>
                <div className="stat-row">
                  <span className="stat-title">Ständerat (Kantonsvertretung):</span>
                  <span className="stat-value">46 Sitze (Majorzwahl, 2 pro Kanton / 1 pro Halbkanton)</span>
                </div>
                <div className="stat-row">
                  <span className="stat-title">Bundesausgaben (Voranschlag 2026):</span>
                  <span className="stat-value">CHF 89.2 Mrd. (EFV)</span>
                </div>
                <div className="stat-row">
                  <span className="stat-title">Schuldenbremse Status:</span>
                  <span className="stat-value text-green">Aktiv eingehalten</span>
                </div>
              </div>

              <div className="quick-actions-box">
                <button onClick={onGoToScorecard} className="scorecard-direct-btn">
                  <span>ZUR PARLAMENTARIER-SCORECARD WECHSELN</span>
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Bevölkerung & Migration 2025 */}
      {activeSection === 'BEVOELKERUNG' && (
        <div className="zahlen-section">
          <div className="migration-lead-box">
            <h2 className="migration-title">Internationale Wanderungsbewegung der Schweiz (2025)</h2>
            <p className="migration-summary-text">
              Im Jahr 2025 zogen <strong>204’261</strong> Personen aus dem Ausland in die Schweiz, davon <strong>181’279</strong> mit ausländischer Staatsangehörigkeit; 
              <strong>133’829</strong> zogen ins Ausland. Der internationale Wanderungssaldo beträgt <strong>+70’432</strong>. 
              Darunter <strong>22’982</strong> Schweizerinnen und Schweizer, die aus dem Ausland zurückkehrten (Quelle: BFS Wanderungsstatistik).
            </p>

            <div className="migration-kpi-row">
              <div className="mig-kpi-item">
                <span className="mig-label">EINWANDERUNG (TOTAL)</span>
                <span className="mig-num">204’261</span>
                <span className="mig-sub">Alle Staatsangehörigkeiten</span>
              </div>
              <div className="mig-kpi-item">
                <span className="mig-label">DAVON AUSLÄNDER</span>
                <span className="mig-num text-red">181’279</span>
                <span className="mig-sub">88,7 % der Zuwanderung</span>
              </div>
              <div className="mig-kpi-item">
                <span className="mig-label">AUSWANDERUNG (TOTAL)</span>
                <span className="mig-num">133’829</span>
                <span className="mig-sub">Wegzüge ins Ausland</span>
              </div>
              <div className="mig-kpi-item highlight">
                <span className="mig-label">NETTO-WANDERUNGSSALDO</span>
                <span className="mig-num text-gold">+70’432</span>
                <span className="mig-sub">Netto-Bevölkerungswachstum</span>
              </div>
            </div>
          </div>

          {/* Migration Chart: 2011 - 2025 */}
          <div className="migration-chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Zuwanderung in die Schweiz im Zeitverlauf (2011 – 2025)</h3>
              <span className="chart-source">Quelle: Bundesamt für Statistik (BFS)</span>
            </div>

            <div className="custom-bar-chart">
              {HISTORICAL_IMMIGRATION.map((item) => {
                const heightPct = Math.round((item.count / maxHistorical) * 100);
                const isPeak = item.year === 2023;
                const isCurrent = item.year === 2025;
                return (
                  <div key={item.year} className="bar-column">
                    <span className="bar-value">
                      {(item.count / 1000).toFixed(0)}k
                    </span>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${isPeak ? 'bar-peak' : isCurrent ? 'bar-current' : ''}`}
                        style={{ height: `${heightPct}%` }}
                      ></div>
                    </div>
                    <span className="bar-year">{item.year}</span>
                  </div>
                );
              })}
            </div>
            <div className="chart-caption">
              Höchststand 2023 mit <strong>263’081</strong> Personen infolge Schutzstatus S (Ukraine-Krieg). 2025 verharrt die Zuwanderung auf hohem Niveau über 200'000 Personen.
            </div>
          </div>

          {/* Migration Table by Nationality */}
          <div className="migration-table-container">
            <h3 className="section-sub-title">Häufigste Staatsangehörigkeiten der Zugewanderten 2025</h3>
            <div className="table-responsive">
              <table className="zahlen-table">
                <thead>
                  <tr>
                    <th>STAATSANGEHÖRIGKEIT</th>
                    <th className="text-right">ZUGEZOGEN</th>
                    <th className="text-right">WEGGEZOGEN</th>
                    <th className="text-right">WANDERUNGSSALDO</th>
                  </tr>
                </thead>
                <tbody>
                  {MIGRATION_DATA.map((row) => (
                    <tr key={row.country}>
                      <td className="font-bold">{row.country}</td>
                      <td className="text-right">{row.inflow.toLocaleString('de-CH')}</td>
                      <td className="text-right">{row.outflow.toLocaleString('de-CH')}</td>
                      <td className="text-right">
                        <span className={`saldo-pill ${row.net > 0 ? 'saldo-positive' : 'saldo-negative'}`}>
                          {row.net > 0 ? `+${row.net.toLocaleString('de-CH')}` : row.net.toLocaleString('de-CH')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Bundesrat (7 Mitglieder + Kanzler) */}
      {activeSection === 'BUNDESRAT' && (
        <div className="zahlen-section">
          <div className="bundesrat-intro-box">
            <h2 className="section-title">Der Bund: Bundesrat & Bundeskanzlei</h2>
            <p className="bundesrat-intro-text">
              Die Landesregierung der Schweizerischen Eidgenossenschaft setzt sich aus sieben gleichberechtigten Mitgliedern des Bundesrates zusammen. 
              Sie entscheiden als Kollegialbehörde. Im Parlament stimmen die Bundesräte gemäss Gewaltenteilung nicht mit (Art. 148 BV).
            </p>
          </div>

          <div className="bundesrat-cards-grid">
            {federalCouncil.map((br) => (
              <div 
                key={br.id} 
                className="bundesrat-member-card"
                onClick={() => onSelectPolitician(br)}
              >
                <div className="br-photo-wrapper" style={{ borderColor: br.partyColor || '#e63946' }}>
                  <img src={br.photo} alt={br.fullName} className="br-photo" />
                </div>
                <div className="br-info">
                  <div className="br-party-badge" style={{ backgroundColor: br.partyColor || '#333' }}>
                    {br.partyAbbr} · {br.canton}
                  </div>
                  <h3 className="br-name">{br.fullName}</h3>
                  <div className="br-dept">{br.department || 'Bundesrat'}</div>
                  <div className="br-meta">
                    <span>Im Amt seit {br.inOfficeSince}</span>
                    <span>• Heimatort: {br.citizenship}</span>
                  </div>
                  <div className="br-role-tag">Exekutive (Keine Stimmabgabe im Rat)</div>
                </div>
              </div>
            ))}

            {/* Viktor Rossi - Bundeskanzler */}
            <div className="bundesrat-member-card chancellor-card">
              <div className="br-photo-wrapper" style={{ borderColor: '#666' }}>
                <img 
                  src="./viktor_rossi.jpg" 
                  alt="Viktor Rossi" 
                  className="br-photo" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Viktor_Rossi_%282025%29_%28cropped%29.jpg/500px-Viktor_Rossi_%282025%29_%28cropped%29.jpg';
                  }}
                />
              </div>
              <div className="br-info">
                <div className="br-party-badge" style={{ backgroundColor: '#2b9348' }}>
                  GLP · BE
                </div>
                <h3 className="br-name">Viktor Rossi</h3>
                <div className="br-dept">Bundeskanzlei (BK)</div>
                <div className="br-meta">
                  <span>Bundeskanzler seit 2024</span>
                  <span>• Heimatort: Bern (BE)</span>
                </div>
                <div className="br-role-tag">Stabschef der Bundesregierung</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: 26 Kantone im Vergleich */}
      {activeSection === 'KANTONE' && (
        <div className="zahlen-section">
          <div className="cantons-header-bar">
            <div>
              <h2 className="section-title">26 Kantone im Vergleich</h2>
              <p className="cantons-subtext">
                Amtliche BFS/SECO-Daten kombiniert mit der durchschnittlichen ProSchweiz Souveränitätsnote der Bundesparlamentarier.
              </p>
            </div>

            <div className="canton-table-search">
              <input
                type="text"
                value={cantonSearch}
                onChange={(e) => setCantonSearch(e.target.value)}
                placeholder="Kanton oder Hauptort suchen..."
                className="canton-search-input"
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="zahlen-table cantons-table">
              <thead>
                <tr>
                  <th onClick={() => { setCantonSortCol('name'); setCantonSortAsc(!cantonSortAsc); }} className="sortable-th">
                    KANTON {cantonSortCol === 'name' && (cantonSortAsc ? '▲' : '▼')}
                  </th>
                  <th>HAUPTORT</th>
                  <th onClick={() => { setCantonSortCol('population'); setCantonSortAsc(!cantonSortAsc); }} className="sortable-th text-right">
                    EINWOHNER (2025) {cantonSortCol === 'population' && (cantonSortAsc ? '▲' : '▼')}
                  </th>
                  <th onClick={() => { setCantonSortCol('foreignersPct'); setCantonSortAsc(!cantonSortAsc); }} className="sortable-th text-right">
                    AUSLÄNDERANTEIL {cantonSortCol === 'foreignersPct' && (cantonSortAsc ? '▲' : '▼')}
                  </th>
                  <th onClick={() => { setCantonSortCol('tax100k'); setCantonSortAsc(!cantonSortAsc); }} className="sortable-th text-right">
                    STEUER (100K) {cantonSortCol === 'tax100k' && (cantonSortAsc ? '▲' : '▼')}
                  </th>
                  <th onClick={() => { setCantonSortCol('unemploymentPct'); setCantonSortAsc(!cantonSortAsc); }} className="sortable-th text-right">
                    ARBEITSLOSE {cantonSortCol === 'unemploymentPct' && (cantonSortAsc ? '▲' : '▼')}
                  </th>
                  <th onClick={() => { setCantonSortCol('grade'); setCantonSortAsc(!cantonSortAsc); }} className="sortable-th text-center">
                    PROSCHWEIZ NOTE {cantonSortCol === 'grade' && (cantonSortAsc ? '▲' : '▼')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCantons.map((c) => {
                  const grade = cantonGrades[c.code] ?? null;
                  const theme = getGradeTheme(grade);
                  return (
                    <tr key={c.code}>
                      <td className="font-bold">
                        <span className="canton-code-tag">{c.code}</span>
                        <span>{c.name}</span>
                      </td>
                      <td>{c.capital}</td>
                      <td className="text-right">{c.population.toLocaleString('de-CH')}</td>
                      <td className="text-right font-medium">
                        <span className={c.foreignersPct > 30 ? 'text-red font-bold' : ''}>
                          {c.foreignersPct.toFixed(1)} %
                        </span>
                      </td>
                      <td className="text-right">CHF {c.tax100k.toLocaleString('de-CH')}</td>
                      <td className="text-right">{c.unemploymentPct.toFixed(1)} %</td>
                      <td className="text-center">
                        {grade !== null ? (
                          <span
                            className="canton-grade-badge"
                            style={{ backgroundColor: theme.bg, color: theme.text }}
                          >
                            {grade.toFixed(2)}
                          </span>
                        ) : (
                          <span className="canton-grade-badge badge-ungraded">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
