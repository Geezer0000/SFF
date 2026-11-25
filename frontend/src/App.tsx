import { useState, useMemo, useEffect } from 'react';
import politiciansData from './data/politicians.json';
import type { Politician } from './types';
import { PoliticianCard } from './components/PoliticianCard';
import { DetailView } from './components/DetailView';
import { SwitzerlandMap } from './components/SwitzerlandMap';
import { AboutView } from './components/AboutView';
import { SwitzerlandInNumbersView } from './components/SwitzerlandInNumbersView';
import { Search, SlidersHorizontal, LayoutGrid, Map as MapIcon, X } from 'lucide-react';
import './App.css';

export function App() {
  const [politicians] = useState<Politician[]>(politiciansData as unknown as Politician[]);
  const [selectedPolitician, setSelectedPolitician] = useState<Politician | null>(null);
  const [currentPage, setCurrentPage] = useState<'SCORECARD' | 'ZAHLEN' | 'ABOUT'>('SCORECARD');
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [showFilters, setShowFilters] = useState<boolean>(true);

  // Auto-scroll to top whenever page or selected politician changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentPage, selectedPolitician]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterScore, setFilterScore] = useState<string>('ALL');
  const [filterParty, setFilterParty] = useState<string>('ALL');
  const [filterCouncil, setFilterCouncil] = useState<string>('ALL');
  const [filterCanton, setFilterCanton] = useState<string>('ALL');
  const [filterCommittee, setFilterCommittee] = useState<string>('ALL');
  const [filterReligion, setFilterReligion] = useState<string>('ALL');
  const [filterCitizenship, setFilterCitizenship] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('GRADE_DESC');

  // Committee list
  const committeeList = useMemo(() => [
    { key: 'WAK', label: 'WAK (Wirtschaft & Abgaben)' },
    { key: 'SiK', label: 'SiK (Sicherheitspolitik)' },
    { key: 'FK', label: 'FK (Finanzkommission)' },
    { key: 'GPK', label: 'GPK (Geschäftsprüfung)' },
    { key: 'RK', label: 'RK (Rechtsfragen)' },
    { key: 'SPK', label: 'SPK (Staatspolitik)' },
    { key: 'APK', label: 'APK (Aussenpolitik)' },
    { key: 'UREK', label: 'UREK (Umwelt & Energie)' },
    { key: 'SGK', label: 'SGK (Gesundheit & Soziales)' },
    { key: 'KVF', label: 'KVF (Verkehr & Fernmeldewesen)' },
    { key: 'WBK', label: 'WBK (Bildung & Kultur)' },
    { key: 'IK', label: 'IK (Immunitätskommission)' },
    { key: 'RedK', label: 'RedK (Redaktionskommission)' },
    { key: 'GK', label: 'GK (Gerichtskommission)' },
    { key: 'Büro', label: 'Büro (Ratsleitung)' }
  ], []);

  // Cantons list
  const cantonList = useMemo(() => {
    const set = new Set(politicians.map(p => p.canton));
    return Array.from(set).sort();
  }, [politicians]);

  // Parties list
  const partyList = useMemo(() => {
    const set = new Set(politicians.map(p => p.partyAbbr));
    return Array.from(set).filter(Boolean).sort();
  }, [politicians]);

  // Religions list
  const religionList = useMemo(() => {
    const set = new Set(politicians.map(p => p.religion));
    return Array.from(set).filter(Boolean).sort();
  }, [politicians]);

  // Citizenships / Passports list
  const citizenshipList = useMemo(() => {
    const set = new Set<string>();
    politicians.forEach(p => {
      (p.passports || []).forEach(pass => set.add(pass));
    });
    return Array.from(set).sort();
  }, [politicians]);

  // Active filters list for chips / pills (matching AFF screenshot)
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (filterScore !== 'ALL') {
      const lbl = filterScore === 'HIGH' ? 'NOTE: 4.5 - 6.0' : filterScore === 'MEDIUM' ? 'NOTE: 3.5 - 4.4' : filterScore === 'LOW' ? 'NOTE: 1.0 - 3.4' : 'BUNDESRAT';
      chips.push({ key: 'score', label: lbl, onRemove: () => setFilterScore('ALL') });
    }
    if (filterParty !== 'ALL') {
      chips.push({ key: 'party', label: filterParty.toUpperCase(), onRemove: () => setFilterParty('ALL') });
    }
    if (filterCouncil !== 'ALL') {
      chips.push({ key: 'council', label: filterCouncil.toUpperCase(), onRemove: () => setFilterCouncil('ALL') });
    }
    if (filterCanton !== 'ALL') {
      chips.push({ key: 'canton', label: filterCanton.toUpperCase(), onRemove: () => setFilterCanton('ALL') });
    }
    if (filterCommittee !== 'ALL') {
      const commItem = committeeList.find(c => c.key === filterCommittee);
      chips.push({
        key: 'committee',
        label: `KOMMISSION: ${commItem ? commItem.key : filterCommittee.toUpperCase()}`,
        onRemove: () => setFilterCommittee('ALL')
      });
    }
    if (filterReligion !== 'ALL') {
      chips.push({ key: 'religion', label: filterReligion.toUpperCase(), onRemove: () => setFilterReligion('ALL') });
    }
    if (filterCitizenship !== 'ALL') {
      chips.push({ key: 'citizenship', label: filterCitizenship.toUpperCase(), onRemove: () => setFilterCitizenship('ALL') });
    }
    if (searchQuery.trim()) {
      chips.push({ key: 'search', label: `"${searchQuery.toUpperCase()}"`, onRemove: () => setSearchQuery('') });
    }
    return chips;
  }, [filterScore, filterParty, filterCouncil, filterCanton, filterCommittee, filterReligion, filterCitizenship, searchQuery, committeeList]);

  const clearAllFilters = () => {
    setFilterScore('ALL');
    setFilterParty('ALL');
    setFilterCouncil('ALL');
    setFilterCanton('ALL');
    setFilterCommittee('ALL');
    setFilterReligion('ALL');
    setFilterCitizenship('ALL');
    setSearchQuery('');
  };

  // Filtered & Sorted list
  const filteredPoliticians = useMemo(() => {
    return politicians.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.party.toLowerCase().includes(q) ||
        p.partyAbbr.toLowerCase().includes(q) ||
        p.canton.toLowerCase().includes(q) ||
        p.cantonName.toLowerCase().includes(q) ||
        (p.birthPlace && p.birthPlace.toLowerCase().includes(q)) ||
        (p.citizenship && p.citizenship.toLowerCase().includes(q)) ||
        (p.religion && p.religion.toLowerCase().includes(q)) ||
        (p.passports && p.passports.some(pass => pass.toLowerCase().includes(q)));

      const matchesScore = filterScore === 'ALL' ||
        (filterScore === 'HIGH' && (p.overallScore ?? 0) >= 4.5) ||
        (filterScore === 'MEDIUM' && (p.overallScore ?? 0) >= 3.5 && (p.overallScore ?? 0) < 4.5) ||
        (filterScore === 'LOW' && (p.overallScore ?? 0) < 3.5 && p.overallScore !== null) ||
        (filterScore === 'UNGRADED' && p.overallScore === null);

      const matchesParty = filterParty === 'ALL' || p.partyAbbr === filterParty;
      const matchesCouncil = filterCouncil === 'ALL' || p.council === filterCouncil;
      const matchesCanton = filterCanton === 'ALL' || p.canton === filterCanton;
      const matchesCommittee = filterCommittee === 'ALL' ||
        (p.committees && p.committees.some(c => 
          (c.abbr && c.abbr.toUpperCase().includes(filterCommittee.toUpperCase())) ||
          (c.name && c.name.toUpperCase().includes(filterCommittee.toUpperCase()))
        ));
      const matchesReligion = filterReligion === 'ALL' || p.religion === filterReligion;
      const matchesCitizenship = filterCitizenship === 'ALL' || (p.passports && p.passports.includes(filterCitizenship));

      return matchesSearch && matchesScore && matchesParty && matchesCouncil && matchesCanton && matchesCommittee && matchesReligion && matchesCitizenship;
    }).sort((a, b) => {
      if (sortBy === 'GRADE_DESC') {
        const sa = a.overallScore ?? -999;
        const sb = b.overallScore ?? -999;
        if (sb !== sa) return sb - sa;
        return a.lastName.localeCompare(b.lastName);
      }
      if (sortBy === 'GRADE_ASC') {
        const sa = a.overallScore ?? 999;
        const sb = b.overallScore ?? 999;
        if (sb !== sa) return sa - sb;
        return a.lastName.localeCompare(b.lastName);
      }
      if (sortBy === 'NAME_ASC') return a.lastName.localeCompare(b.lastName);
      if (sortBy === 'NAME_DESC') return b.lastName.localeCompare(a.lastName);
      if (sortBy === 'CANTON') return a.canton.localeCompare(b.canton);
      return 0;
    });
  }, [politicians, searchQuery, filterScore, filterParty, filterCouncil, filterCanton, filterReligion, filterCitizenship, sortBy]);

  return (
    <div className="app-root">
      {/* Top Header - Exact America First Navigation */}
      <header className="site-header">
        <div className="header-inner">
          <div className="logo-group" onClick={() => { setSelectedPolitician(null); setCurrentPage('SCORECARD'); setViewMode('LIST'); }}>
            <div className="logo-badge">PRO</div>
            <span className="logo-title">PROSCHWEIZ SCORECARD</span>
          </div>

          <nav className="header-nav">
            <button
              onClick={() => { setSelectedPolitician(null); setCurrentPage('ABOUT'); }}
              className={`nav-link-btn ${currentPage === 'ABOUT' ? 'active' : ''}`}
            >
              ABOUT
            </button>
            <button
              onClick={() => { setSelectedPolitician(null); setCurrentPage('ZAHLEN'); }}
              className={`nav-link-btn ${currentPage === 'ZAHLEN' ? 'active' : ''}`}
            >
              SCHWEIZ IN ZAHLEN
            </button>
            <button
              onClick={() => { setSelectedPolitician(null); setCurrentPage('SCORECARD'); }}
              className={`nav-link-btn ${currentPage === 'SCORECARD' ? 'active' : ''}`}
            >
              SCORECARD
            </button>
            <button
              onClick={() => { setSelectedPolitician(null); setCurrentPage('SCORECARD'); }}
              className="nav-action-btn"
            >
              PROSCHWEIZ
            </button>
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main className="main-content">
        {currentPage === 'ABOUT' ? (
          <AboutView onGoToScorecard={() => setCurrentPage('SCORECARD')} />
        ) : currentPage === 'ZAHLEN' ? (
          <SwitzerlandInNumbersView
            politicians={politicians}
            onSelectPolitician={(p) => {
              setSelectedPolitician(p);
              setCurrentPage('SCORECARD');
            }}
            onGoToScorecard={() => setCurrentPage('SCORECARD')}
          />
        ) : selectedPolitician ? (
          <DetailView
            politician={selectedPolitician}
            allPoliticians={politicians}
            onBack={() => setSelectedPolitician(null)}
            onSelectPolitician={(pol) => setSelectedPolitician(pol)}
          />
        ) : (
          <div className="scorecard-container">
            {/* Page Title */}
            <div className="page-header-row">
              <h1 className="page-title">
                BUNDESVERSAMMLUNG & BUNDESRAT
              </h1>
              <span className="page-subtitle">
                {filteredPoliticians.length} Politiker im Index (Nationalrat, Ständerat, Bundesrat)
              </span>
            </div>

            {/* Controls Bar: Search + View Toggle + Filters Button + Sort Dropdown */}
            <div className="controls-row">
              {/* Search Bar */}
              <div className="search-bar-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH NAME, PARTY, CANTON, BIRTHPLACE, RELIGION, PASSPORT..."
                  className="search-input"
                />
              </div>

              {/* View Toggle: LIST / MAP */}
              <div className="view-toggle-group">
                <button
                  onClick={() => setViewMode('LIST')}
                  className={`toggle-btn ${viewMode === 'LIST' ? 'active' : ''}`}
                >
                  <LayoutGrid size={15} />
                  <span>LIST</span>
                </button>
                <button
                  onClick={() => setViewMode('MAP')}
                  className={`toggle-btn ${viewMode === 'MAP' ? 'active' : ''}`}
                >
                  <MapIcon size={15} />
                  <span>MAP</span>
                </button>
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`filters-btn ${showFilters ? 'active' : ''}`}
              >
                <SlidersHorizontal size={15} />
                <span>FILTERS {activeChips.length > 0 ? `(${activeChips.length})` : ''}</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="sort-dropdown-wrapper">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="GRADE_DESC">SORT BY: NOTE (BESTE ZUERST)</option>
                  <option value="GRADE_ASC">SORT BY: NOTE (TIEFSTE ZUERST)</option>
                  <option value="NAME_ASC">SORT BY: NAME (A-Z)</option>
                  <option value="NAME_DESC">SORT BY: NAME (Z-A)</option>
                  <option value="CANTON">SORT BY: KANTON</option>
                </select>
              </div>
            </div>

            {/* Filters Row: Single Row Aligned Inputs matching America First */}
            {showFilters && (
              <div className="filter-shelf">
                <div className="filter-select-wrapper">
                  <select
                    value={filterScore}
                    onChange={(e) => setFilterScore(e.target.value)}
                    className={`shelf-select ${filterScore !== 'ALL' ? 'filter-active' : ''}`}
                  >
                    <option value="ALL">{filterScore !== 'ALL' ? 'TOTAL SCORE (1)' : 'TOTAL SCORE'}</option>
                    <option value="HIGH">Note 4.5 – 6.0 (Sehr gut)</option>
                    <option value="MEDIUM">Note 3.5 – 4.4 (Mittel)</option>
                    <option value="LOW">Note 1.0 – 3.4 (Ungenügend)</option>
                    <option value="UNGRADED">Bundesrat & Präsidium (Ungraded)</option>
                  </select>
                </div>

                <div className="filter-select-wrapper">
                  <select
                    value={filterParty}
                    onChange={(e) => setFilterParty(e.target.value)}
                    className={`shelf-select ${filterParty !== 'ALL' ? 'filter-active' : ''}`}
                  >
                    <option value="ALL">{filterParty !== 'ALL' ? `PARTY (${filterParty})` : 'PARTY'}</option>
                    {partyList.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-select-wrapper">
                  <select
                    value={filterCouncil}
                    onChange={(e) => setFilterCouncil(e.target.value)}
                    className={`shelf-select ${filterCouncil !== 'ALL' ? 'filter-active' : ''}`}
                  >
                    <option value="ALL">{filterCouncil !== 'ALL' ? `CHAMBER (1)` : 'CHAMBER'}</option>
                    <option value="Bundesrat">Bundesrat (7)</option>
                    <option value="Nationalrat">Nationalrat (200)</option>
                    <option value="Ständerat">Ständerat (46)</option>
                  </select>
                </div>

                <div className="filter-select-wrapper">
                  <select
                    value={filterCanton}
                    onChange={(e) => setFilterCanton(e.target.value)}
                    className={`shelf-select ${filterCanton !== 'ALL' ? 'filter-active' : ''}`}
                  >
                    <option value="ALL">{filterCanton !== 'ALL' ? `STATE (${filterCanton})` : 'STATE / CANTON'}</option>
                    {cantonList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Kommission */}
                <div className="filter-select-wrapper">
                  <select
                    value={filterCommittee}
                    onChange={(e) => setFilterCommittee(e.target.value)}
                    className={`shelf-select ${filterCommittee !== 'ALL' ? 'filter-active' : ''}`}
                  >
                    <option value="ALL">{filterCommittee !== 'ALL' ? `KOMMISSION (1)` : 'KOMMISSION'}</option>
                    {committeeList.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Religion / Konfession */}
                <div className="filter-select-wrapper">
                  <select
                    value={filterReligion}
                    onChange={(e) => setFilterReligion(e.target.value)}
                    className={`shelf-select ${filterReligion !== 'ALL' ? 'filter-active' : ''}`}
                  >
                    <option value="ALL">{filterReligion !== 'ALL' ? `RELIGION (1)` : 'RELIGION'}</option>
                    {religionList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Staatsangehörigkeit / Pass */}
                <div className="filter-select-wrapper">
                  <select
                    value={filterCitizenship}
                    onChange={(e) => setFilterCitizenship(e.target.value)}
                    className={`shelf-select ${filterCitizenship !== 'ALL' ? 'filter-active' : ''}`}
                  >
                    <option value="ALL">{filterCitizenship !== 'ALL' ? `PASS (1)` : 'PASS / BÜRGERRECHT'}</option>
                    {citizenshipList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-select-wrapper">
                  <select className="shelf-select" disabled>
                    <option>GRADE</option>
                  </select>
                </div>
              </div>
            )}

            {/* Active Filter Chips / Pills with [X] (Matching AFF Reference Screenshot) */}
            {activeChips.length > 0 && (
              <div className="active-filter-chips-row">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={chip.onRemove}
                    className="filter-chip-btn"
                  >
                    <span>{chip.label}</span>
                    <X size={13} className="chip-x-icon" />
                  </button>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="clear-all-filters-btn"
                >
                  CLEAR ALL
                </button>
              </div>
            )}

            {/* Content: List (Grid) or Map View */}
            {viewMode === 'LIST' ? (
              <div className="politicians-grid">
                {filteredPoliticians.length === 0 ? (
                  <div className="empty-results-box">
                    Keine Parlamentarier gefunden für die gewählten Suchkriterien.
                  </div>
                ) : (
                  filteredPoliticians.map((politician) => (
                    <PoliticianCard
                      key={politician.id}
                      politician={politician}
                      onClick={() => setSelectedPolitician(politician)}
                    />
                  ))
                )}
              </div>
            ) : (
              <SwitzerlandMap
                politicians={filteredPoliticians}
                selectedCanton={filterCanton === 'ALL' ? '' : filterCanton}
                onSelectCanton={(canton) => setFilterCanton(canton || 'ALL')}
                onSelectPolitician={(politician) => setSelectedPolitician(politician)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
