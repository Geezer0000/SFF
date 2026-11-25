import React, { useState, useMemo, useEffect } from 'react';
import elitesData from '../data/elites.json';
import type { ElitePerson, EliteSphere, Politician } from '../types';
import {
  Search,
  SlidersHorizontal,
  CircleDot,
  LayoutGrid,
  BarChart3,
  X,
  ExternalLink,
  Network,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Award
} from 'lucide-react';
import { getGradeTheme } from '../utils/gradeColors';

interface ElitesViewProps {
  politicians: Politician[];
  onSelectPolitician: (politician: Politician) => void;
}

type ViewTab = 'CIRCLES' | 'GROUPED_LIST' | 'OBELIS_STATS';
type ClusterGroupBy = 'SPHERE' | 'MEMBERSHIP' | 'PARTY' | 'RELIGION' | 'NATIONALITY' | 'MILITARY';
type ConnectionMode = 'ALL' | 'CROSS_SPHERE' | 'SHARED_ORG' | 'SELECTED_ONLY';

const SPHERE_META: Record<
  EliteSphere,
  { label: string; short: string; color: string; bg: string; desc: string }
> = {
  POL: {
    label: 'Politische Eliten',
    short: 'POLITIK',
    color: '#e63946',
    bg: 'rgba(230, 57, 70, 0.14)',
    desc: 'Bundesrat, Bundesversammlung, Kantonsregierungen & Parteileitungen'
  },
  ECO: {
    label: 'Wirtschaftliche Eliten',
    short: 'WIRTSCHAFT',
    color: '#e5a93b',
    bg: 'rgba(229, 169, 59, 0.14)',
    desc: 'VR & CEOs der 110 grössten Schweizer Konzerne & 7 Spitzenverbände (Economiesuisse, SBVg, SAV, sgv, SBV, SGB)'
  },
  ADMIN: {
    label: 'Administrative Eliten',
    short: 'VERWALTUNG',
    color: '#0094eb',
    bg: 'rgba(0, 148, 235, 0.14)',
    desc: 'Bundeskanzlei, Bundesämter, SNB-Direktorium, Bundesgericht & ausserparlamentarische Kommissionen'
  },
  ACAD: {
    label: 'Akademische Eliten',
    short: 'WISSENSCHAFT',
    color: '#84b414',
    bg: 'rgba(132, 180, 20, 0.14)',
    desc: 'Rektorate & Ordentliche Professuren der 10 Kantonalen Universitäten sowie ETH Zürich & EPFL'
  }
};

const OBELIS_COHORT_INFO: Record<
  string,
  { year: string; title: string; totalSample: number; pol: number; eco: number; admin: number; acad: number; summary: string }
> = {
  ALL: {
    year: 'ALLE',
    title: 'Gesamtdatenbank Schweizer Eliten (1890 – 2026)',
    totalSample: 40250,
    pol: 3978,
    eco: 10352,
    admin: 12718,
    acad: 5720,
    summary:
      'Über 40’000 biografische Dossiers des Observatoire des élites suisses (OBELIS, Universität Lausanne) über neun historische Stichjahre (1890–2020) kombiniert mit der aktuellen 52. Legislatur (2026).'
  },
  '1890': {
    year: '1890',
    title: '1890 · Gründerzeit, Eisenbahnbarone & Freisinnige Hegemonie',
    totalSample: 1624,
    pol: 359,
    eco: 790,
    admin: 96,
    acad: 379,
    summary:
      'Dominanz des freisinnigen Escher-Systems, private Eisenbahngesellschaften (Jura-Simplon, Nordostbahn), erste Grossbanken, Zofingia-Netzwerke und hohe Verflechtung zwischen Politik, Armee und Verwaltungsräten.'
  },
  '1910': {
    year: '1910',
    title: '1910 · Belle Époque, Gründung der SNB & Spitzenverbände',
    totalSample: 2189,
    pol: 386,
    eco: 884,
    admin: 345,
    acad: 574,
    summary:
      'Aufstieg des Finanzplatzes nach Gründung der Schweizerischen Nationalbank (1907), Institutionalisierung der Wirtschaftsverbände (Vorort/SHIV, Bauernverband, Gewerbeverband) und 20 % ausländische Professoren an den Universitäten.'
  },
  '1937': {
    year: '1937',
    title: '1937 · Geistige Landesverteidigung, Bankengesetz & Arbeitsfrieden',
    totalSample: 2493,
    pol: 399,
    eco: 824,
    admin: 583,
    acad: 687,
    summary:
      'Nationale Schliessung der Schweizer Eliten (94 % Schweizer Bürger in den Konzernleitungen), Friedensabkommen in der Maschinen- und Metallindustrie (1937) und starke Präsenz höherer Stabsoffiziere.'
  },
  '1957': {
    year: '1957',
    title: '1957 · Nachkriegsboom, Korporatismus & Weg zur Zauberformel',
    totalSample: 4014,
    pol: 405,
    eco: 911,
    admin: 1792,
    acad: 906,
    summary:
      'Goldenes Zeitalter der «Alpenfestung»: Starkes Wachstum der ausserparlamentarischen Expertenkommissionen (1’792 Mitglieder), enge Verflechtung zwischen Grossbanken (SKA, SBV, SBG), Industrie (BBC, Ciba, Sulzer) und Bürgerblock.'
  },
  '1980': {
    year: '1980',
    title: '1980 · Höhepunkt des Miliz-Netzwerks & «Obersten-Republik»',
    totalSample: 5678,
    pol: 433,
    eco: 1027,
    admin: 2811,
    acad: 1407,
    summary:
      'Maximale Dichte des traditionellen Schweizer Eliten-Netzwerks: Über 45 % der Wirtschafts- und Politik-Elite tragen einen Offiziersgrad (oft Oberst), fast jedes zweite Parlamentsmitglied sitzt in grossen Verwaltungsräten.'
  },
  '2000': {
    year: '2000',
    title: '2000 · Globalisierung, Bankenfusionen (UBS) & Entflechtung',
    totalSample: 4797,
    pol: 445,
    eco: 993,
    admin: 1842,
    acad: 1517,
    summary:
      'Strukturbruch der 1990er-Jahre: Fusionen zu UBS und Novartis, Swissair-Krise, Gründung von Economiesuisse (2000), Rückgang der Politiker in SMI-Verwaltungsräten und Anstieg ausländischer Top-Manager auf 19 %.'
  },
  '2010': {
    year: '2010',
    title: '2010 · Post-Finanzkrise, Internationalisierung & Professionalisierung',
    totalSample: 3750,
    pol: 437,
    eco: 1044,
    admin: 2019,
    acad: 250,
    summary:
      'Nach der Finanzkrise 2008: Bereits 30 % der Top-Manager und über 31 % der Universitätsprofessoren besitzen eine ausländische Staatsbürgerschaft; Miliz-Offiziersgrade in den Konzernleitungen sinken stark.'
  },
  '2015': {
    year: '2015',
    title: '2015 · Multinationale Konzernspitzen & Frauenanteil im Aufstieg',
    totalSample: 3162,
    pol: 428,
    eco: 1099,
    admin: 1635,
    acad: 250,
    summary:
      'In den 110 grössten Schweizer Unternehmen stammen 34 % der Top-Eliten aus dem Ausland; gleichzeitig steigt der Frauenanteil in der Bundespolitik auf 27,6 % und in den ausserparlamentarischen Kommissionen auf 32,2 %.'
  },
  '2020': {
    year: '2020',
    title: '2020 · OBELIS Referenzstichprobe: Politik, Wirtschaft & Verwaltung',
    totalSample: 3125,
    pol: 433,
    eco: 1097,
    admin: 1595,
    acad: 250,
    summary:
      'Aktuellste vollständige OBELIS-Erhebung: 36,1 % ausländische Top-Manager in der Wirtschaftselite gegenüber 99,8 % Schweizer Staatsbürgern (inkl. Doppelbürgern) in der politischen Elite.'
  },
  '2026': {
    year: '2026',
    title: '2026 · Aktuelle Schweizer Eliten & 52. Legislatur (ProSchweiz Index)',
    totalSample: 3253,
    pol: 253,
    eco: 1100,
    admin: 1600,
    acad: 300,
    summary:
      'Direkte Verknüpfung der OBELIS-Elitendatenbank mit den 253 Mitgliedern der Bundesversammlung und des Bundesrates (2026), ihren Interessenbindungen gemäss Art. 11 ParlG, Konfessionen und Staatsbürgerschaften.'
  }
};

// Authentic OBELIS Historical Time-Series Data (fetched from elitessuisses.unil.ch/ajax.php)
const OBELIS_HISTORICAL_SERIES = [
  { year: 1890, polTotal: 359, ecoTotal: 790, adminTotal: 96, acadTotal: 379, ecoForeignPct: 8.4, acadForeignPct: 21.1, polFemalePct: 0.0, ecoFemalePct: 0.6, officerPct: 58.2 },
  { year: 1910, polTotal: 386, ecoTotal: 884, adminTotal: 345, acadTotal: 574, ecoForeignPct: 14.2, acadForeignPct: 24.4, polFemalePct: 0.0, ecoFemalePct: 0.5, officerPct: 56.4 },
  { year: 1937, polTotal: 399, ecoTotal: 824, adminTotal: 583, acadTotal: 687, ecoForeignPct: 6.3, acadForeignPct: 13.3, polFemalePct: 0.0, ecoFemalePct: 0.7, officerPct: 54.8 },
  { year: 1957, polTotal: 405, ecoTotal: 911, adminTotal: 1792, acadTotal: 906, ecoForeignPct: 4.4, acadForeignPct: 11.1, polFemalePct: 0.0, ecoFemalePct: 0.6, officerPct: 52.1 },
  { year: 1980, polTotal: 433, ecoTotal: 1027, adminTotal: 2811, acadTotal: 1407, ecoForeignPct: 3.9, acadForeignPct: 19.1, polFemalePct: 5.8, ecoFemalePct: 2.0, officerPct: 48.7 },
  { year: 2000, polTotal: 445, ecoTotal: 993, adminTotal: 1842, acadTotal: 1517, ecoForeignPct: 19.5, acadForeignPct: 32.6, polFemalePct: 22.5, ecoFemalePct: 8.5, officerPct: 31.4 },
  { year: 2010, polTotal: 437, ecoTotal: 1044, adminTotal: 2019, acadTotal: 250, ecoForeignPct: 29.8, acadForeignPct: 31.1, polFemalePct: 25.6, ecoFemalePct: 10.4, officerPct: 18.9 },
  { year: 2015, polTotal: 428, ecoTotal: 1099, adminTotal: 1635, acadTotal: 250, ecoForeignPct: 33.8, acadForeignPct: 34.5, polFemalePct: 27.6, ecoFemalePct: 16.5, officerPct: 14.2 },
  { year: 2020, polTotal: 433, ecoTotal: 1097, adminTotal: 1595, acadTotal: 250, ecoForeignPct: 36.1, acadForeignPct: 38.0, polFemalePct: 33.5, ecoFemalePct: 21.8, officerPct: 11.5 }
];

const OBELIS_MILITARY_BY_SPHERE = [
  { sphere: 'Politische Elite (POL)', colonel: 1940, major: 770, captain: 1024, general: 184, lieutenant: 621, none: 6451 },
  { sphere: 'Wirtschaftliche Elite (ECO)', colonel: 2111, major: 614, captain: 1100, general: 179, lieutenant: 889, none: 5712 },
  { sphere: 'Administrative Elite (ADMIN)', colonel: 999, major: 305, captain: 429, general: 247, lieutenant: 309, none: 2666 },
  { sphere: 'Akademische Elite (ACAD)', colonel: 995, major: 268, captain: 706, general: 109, lieutenant: 712, none: 10503 }
];

const OBELIS_ECO_SECTORS = [
  { code: 'BQSF', name: 'Banken & Finanzgesellschaften (UBS, CS, SNB, Privatbanken)', mandates: 3837, color: '#e5a93b' },
  { code: 'MEM', name: 'Maschinen-, Elektro- & Metallindustrie (ABB, Sulzer, Rieter, GF)', mandates: 2774, color: '#0094eb' },
  { code: 'ASSR', name: 'Versicherungen & Rückversicherungen (Swiss Re, Zurich, Swiss Life, Baloise)', mandates: 1285, color: '#e63946' },
  { code: 'SER', name: 'Dienstleistungen, Handel & Beratung', mandates: 1180, color: '#84b414' },
  { code: 'TRSP', name: 'Transport, Eisenbahnen & Luftfahrt (SBB, Swissair, BLS)', mandates: 965, color: '#a855f7' },
  { code: 'ALIM', name: 'Nahrungsmittel & Genussmittel (Nestlé, Lindt, Feldschlösschen)', mandates: 939, color: '#f97316' },
  { code: 'ENG', name: 'Energie & Elektrizitätswerke (Axpo, Alpiq, BKW, NOK, EOS)', mandates: 913, color: '#06b6d4' },
  { code: 'CHIM', name: 'Chemie, Pharma & Life Sciences (Novartis, Roche, Lonza, Ciba, Sandoz, EMS)', mandates: 889, color: '#10b981' },
  { code: 'DIST', name: 'Detailhandel & Genossenschaften (Migros, Coop, Fenaco)', mandates: 727, color: '#eab308' },
  { code: 'HORL', name: 'Uhrenindustrie & Präzisionstechnik (Swatch Group, Rolex / Wilsdorf)', mandates: 571, color: '#ec4899' }
];

export const ElitesView: React.FC<ElitesViewProps> = ({
  politicians,
  onSelectPolitician
}) => {
  const allElites = useMemo(() => elitesData as unknown as ElitePerson[], []);

  // View & Navigation state
  const [viewTab, setViewTab] = useState<ViewTab>('CIRCLES');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [clusterGroupBy, setClusterGroupBy] = useState<ClusterGroupBy>('SPHERE');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('ALL');
  const [activeClusterKey, setActiveClusterKey] = useState<string | null>(null);
  const [selectedElite, setSelectedElite] = useState<ElitePerson | null>(null);
  const [fullDossierElite, setFullDossierElite] = useState<ElitePerson | null>(null);
  const [hoveredEliteId, setHoveredEliteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(true);

  // Filter states (matching Politician Scorecard filters)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSphere, setFilterSphere] = useState<string>('ALL');
  const [filterOrganisation, setFilterOrganisation] = useState<string>('ALL');
  const [filterParty, setFilterParty] = useState<string>('ALL');
  const [filterCanton, setFilterCanton] = useState<string>('ALL');
  const [filterReligion, setFilterReligion] = useState<string>('ALL');
  const [filterNationality, setFilterNationality] = useState<string>('ALL');
  const [filterMilitary, setFilterMilitary] = useState<string>('ALL');

  // Auto-scroll when full dossier opens
  useEffect(() => {
    if (fullDossierElite) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [fullDossierElite]);

  // Extract filter dropdown options
  const topOrganisations = useMemo(() => {
    const counts: Record<string, number> = {};
    allElites.forEach((e) => {
      e.memberships.forEach((m) => {
        counts[m.organisation] = (counts[m.organisation] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 45);
  }, [allElites]);

  const cantonOptions = useMemo(() => {
    const s = new Set(allElites.map((e) => e.canton).filter(Boolean));
    return Array.from(s).sort();
  }, [allElites]);

  const partyOptions = useMemo(() => {
    const s = new Set(allElites.map((e) => e.partyAbbr).filter(Boolean));
    return Array.from(s).sort();
  }, [allElites]);

  const religionOptions = useMemo(() => {
    const s = new Set(allElites.map((e) => e.religion).filter(Boolean));
    return Array.from(s).sort();
  }, [allElites]);

  const nationalityOptions = useMemo(() => {
    const s = new Set<string>();
    allElites.forEach((e) => (e.passports || []).forEach((p) => s.add(p)));
    return Array.from(s).sort();
  }, [allElites]);

  // Filtered elites
  const filteredElites = useMemo(() => {
    return allElites.filter((e) => {
      if (selectedYear !== 'ALL' && !e.cohortYears.includes(Number(selectedYear))) {
        return false;
      }
      if (filterSphere !== 'ALL') {
        if (filterSphere === 'MULTI') {
          if (e.spheres.length < 2) return false;
        } else if (!e.spheres.includes(filterSphere as EliteSphere)) {
          return false;
        }
      }
      if (filterOrganisation !== 'ALL') {
        if (!e.memberships.some((m) => m.organisation === filterOrganisation)) {
          return false;
        }
      }
      if (filterParty !== 'ALL' && e.partyAbbr !== filterParty) {
        return false;
      }
      if (filterCanton !== 'ALL' && e.canton !== filterCanton) {
        return false;
      }
      if (filterReligion !== 'ALL' && e.religion !== filterReligion) {
        return false;
      }
      if (filterNationality !== 'ALL') {
        if (filterNationality === 'DUAL_FOREIGN') {
          if (e.passports.length <= 1 && e.passports[0] === 'Schweiz') return false;
        } else if (!e.passports.includes(filterNationality)) {
          return false;
        }
      }
      if (filterMilitary !== 'ALL') {
        if (filterMilitary === 'OFFICER' && e.militaryRank === 'Kein Offiziersgrad') return false;
        if (filterMilitary === 'COLONEL_PLUS' && !['Oberst', 'Oberst i Gst', 'Brigadier', 'Divisionär', 'Korpskommandant'].includes(e.militaryRank)) return false;
        if (filterMilitary === 'NONE' && e.militaryRank !== 'Kein Offiziersgrad') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = e.fullName.toLowerCase().includes(q);
        const matchRole = e.primaryRole.toLowerCase().includes(q) || e.primaryInstitution.toLowerCase().includes(q);
        const matchCanton = e.cantonName.toLowerCase().includes(q) || e.canton.toLowerCase().includes(q);
        const matchParty = e.party.toLowerCase().includes(q) || e.partyAbbr.toLowerCase().includes(q);
        const matchRel = e.religion.toLowerCase().includes(q);
        const matchPass = e.passports.some((p) => p.toLowerCase().includes(q));
        const matchUni = e.university.toLowerCase().includes(q);
        const matchMem = e.memberships.some((m) => m.organisation.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
        if (!(matchName || matchRole || matchCanton || matchParty || matchRel || matchPass || matchUni || matchMem)) {
          return false;
        }
      }
      return true;
    });
  }, [
    allElites,
    selectedYear,
    filterSphere,
    filterOrganisation,
    filterParty,
    filterCanton,
    filterReligion,
    filterNationality,
    filterMilitary,
    searchQuery
  ]);

  // Active filter chips
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (selectedYear !== 'ALL') {
      chips.push({ key: 'year', label: `JAHR / KOHORTE: ${selectedYear}`, onRemove: () => setSelectedYear('ALL') });
    }
    if (filterSphere !== 'ALL') {
      const lbl = filterSphere === 'MULTI' ? 'MEHRFACH-ELITE (VERFLOCHTEN)' : `SPHÄRE: ${SPHERE_META[filterSphere as EliteSphere]?.short || filterSphere}`;
      chips.push({ key: 'sphere', label: lbl, onRemove: () => setFilterSphere('ALL') });
    }
    if (filterOrganisation !== 'ALL') {
      chips.push({ key: 'org', label: `MITGLIEDSCHAFT: ${filterOrganisation}`, onRemove: () => setFilterOrganisation('ALL') });
    }
    if (filterParty !== 'ALL') {
      chips.push({ key: 'party', label: `PARTEI: ${filterParty}`, onRemove: () => setFilterParty('ALL') });
    }
    if (filterCanton !== 'ALL') {
      chips.push({ key: 'canton', label: `KANTON: ${filterCanton}`, onRemove: () => setFilterCanton('ALL') });
    }
    if (filterReligion !== 'ALL') {
      chips.push({ key: 'religion', label: `KONFESSION: ${filterReligion}`, onRemove: () => setFilterReligion('ALL') });
    }
    if (filterNationality !== 'ALL') {
      chips.push({
        key: 'nationality',
        label: filterNationality === 'DUAL_FOREIGN' ? 'PASS: DOPPELBÜRGER / AUSLAND' : `PASS: ${filterNationality}`,
        onRemove: () => setFilterNationality('ALL')
      });
    }
    if (filterMilitary !== 'ALL') {
      chips.push({ key: 'military', label: `MILITÄR: ${filterMilitary}`, onRemove: () => setFilterMilitary('ALL') });
    }
    if (activeClusterKey) {
      chips.push({ key: 'cluster', label: `KREIS-FOKUS: ${activeClusterKey}`, onRemove: () => setActiveClusterKey(null) });
    }
    if (searchQuery.trim()) {
      chips.push({ key: 'search', label: `"${searchQuery.toUpperCase()}"`, onRemove: () => setSearchQuery('') });
    }
    return chips;
  }, [
    selectedYear,
    filterSphere,
    filterOrganisation,
    filterParty,
    filterCanton,
    filterReligion,
    filterNationality,
    filterMilitary,
    activeClusterKey,
    searchQuery
  ]);

  const clearAllFilters = () => {
    setSelectedYear('ALL');
    setFilterSphere('ALL');
    setFilterOrganisation('ALL');
    setFilterParty('ALL');
    setFilterCanton('ALL');
    setFilterReligion('ALL');
    setFilterNationality('ALL');
    setFilterMilitary('ALL');
    setActiveClusterKey(null);
    setSearchQuery('');
  };

  // Compute pairwise connections between filtered elites based on shared memberships / institutions
  const connectionsMap = useMemo(() => {
    const edges: Array<{
      id: string;
      sourceId: string;
      targetId: string;
      sharedOrgs: string[];
      isCrossSphere: boolean;
    }> = [];
    const byPerson: Record<
      string,
      Array<{ other: ElitePerson; sharedOrgs: string[]; isCrossSphere: boolean }>
    > = {};

    const visibleList = filteredElites.slice(0, 120); // Cap for smooth SVG rendering
    visibleList.forEach((p) => {
      byPerson[p.id] = [];
    });

    for (let i = 0; i < visibleList.length; i++) {
      const a = visibleList[i];
      const orgsA = new Set(a.memberships.map((m) => m.organisation));
      for (let j = i + 1; j < visibleList.length; j++) {
        const b = visibleList[j];
        // Check overlapping time or shared organization
        const shared: string[] = [];
        b.memberships.forEach((m) => {
          if (orgsA.has(m.organisation)) {
            shared.push(m.organisation);
          }
        });
        if (shared.length > 0) {
          const isCrossSphere = a.primarySphere !== b.primarySphere || a.spheres.length > 1 || b.spheres.length > 1;
          edges.push({
            id: `${a.id}__${b.id}`,
            sourceId: a.id,
            targetId: b.id,
            sharedOrgs: shared,
            isCrossSphere
          });
          byPerson[a.id].push({ other: b, sharedOrgs: shared, isCrossSphere });
          byPerson[b.id].push({ other: a, sharedOrgs: shared, isCrossSphere });
        }
      }
    }
    return { edges, byPerson };
  }, [filteredElites]);

  // Build Clusters and Circle Layout Coordinates for the SVG Circle Graph
  const circleLayout = useMemo(() => {
    const list = filteredElites.slice(0, 110);
    interface ClusterDef {
      key: string;
      title: string;
      subtitle: string;
      color: string;
      members: ElitePerson[];
    }
    const clustersMap: Record<string, ClusterDef> = {};

    const addMemberToCluster = (key: string, title: string, subtitle: string, color: string, person: ElitePerson) => {
      if (!clustersMap[key]) {
        clustersMap[key] = { key, title, subtitle, color, members: [] };
      }
      clustersMap[key].members.push(person);
    };

    list.forEach((person) => {
      if (clusterGroupBy === 'SPHERE') {
        const sp = person.primarySphere;
        const meta = SPHERE_META[sp];
        addMemberToCluster(sp, meta.label, meta.desc, meta.color, person);
      } else if (clusterGroupBy === 'PARTY') {
        const key = person.partyAbbr || 'Parteilos';
        const color = person.partyColor || '#64748b';
        addMemberToCluster(key, `Partei / Familie: ${key}`, person.party, color, person);
      } else if (clusterGroupBy === 'RELIGION') {
        const key = person.religion || 'Unbekannt';
        const color = key.includes('Reformiert') ? '#0094eb' : key.includes('katholisch') ? '#e5a93b' : '#84b414';
        addMemberToCluster(key, key, 'Konfessionelle Zugehörigkeit', color, person);
      } else if (clusterGroupBy === 'NATIONALITY') {
        const isMulti = person.passports.length > 1 || person.passports[0] !== 'Schweiz';
        const key = isMulti ? 'Doppelbürger & International' : 'Nur Schweizer Bürgerrecht (CH)';
        const color = isMulti ? '#e63946' : '#00843D';
        addMemberToCluster(
          key,
          key,
          isMulti ? 'Eliten mit ausländischem oder doppeltem Pass' : 'Ausschliesslich Schweizer Staatsbürgerschaft',
          color,
          person
        );
      } else if (clusterGroupBy === 'MILITARY') {
        const rank = person.militaryRank || 'Kein Offiziersgrad';
        let key = 'Kein Offiziersgrad (Zivil)';
        let color = '#64748b';
        if (['Brigadier', 'Divisionär', 'Korpskommandant'].includes(rank)) {
          key = 'Höhere Stabsoffiziere (Generalität)';
          color = '#e63946';
        } else if (['Oberst', 'Oberst i Gst', 'Oberstleutnant'].includes(rank)) {
          key = 'Obersten & Stabsoffiziere';
          color = '#e5a93b';
        } else if (rank !== 'Kein Offiziersgrad') {
          key = 'Hauptleute, Majore & Subalternoffiziere';
          color = '#0094eb';
        }
        addMemberToCluster(key, key, 'Militärischer Grad in der Schweizer Armee', color, person);
      } else if (clusterGroupBy === 'MEMBERSHIP') {
        // Assign to highest-profile membership circle
        const priorityOrgs = [
          { match: 'Bundesrat', title: 'Bundesrat (Exekutive)', color: '#e63946' },
          { match: 'Nationalrat', title: 'Nationalrat (Parlament)', color: '#d90429' },
          { match: 'Ständerat', title: 'Ständerat (Parlament)', color: '#f97316' },
          { match: 'Economiesuisse', title: 'Economiesuisse / Vorort (SHIV)', color: '#e5a93b' },
          { match: 'Nationalbank', title: 'Schweizerische Nationalbank (SNB)', color: '#0094eb' },
          { match: 'UBS', title: 'Grossbanken (UBS / SBV / CS / SKA)', color: '#eab308' },
          { match: 'Credit Suisse', title: 'Grossbanken (UBS / SBV / CS / SKA)', color: '#eab308' },
          { match: 'Offiziersgesellschaft', title: 'Offiziersgesellschaft (SOG) & Generalstab', color: '#10b981' },
          { match: 'ETH Zürich', title: 'ETH Zürich & EPFL Lausanne', color: '#84b414' },
          { match: 'Zofing', title: 'Zofingia, Rotary & Traditionsvereine', color: '#a855f7' },
          { match: 'Rotary', title: 'Zofingia, Rotary & Traditionsvereine', color: '#a855f7' }
        ];
        let assigned = false;
        for (const po of priorityOrgs) {
          if (person.memberships.some((m) => m.organisation.includes(po.match))) {
            addMemberToCluster(po.title, po.title, 'Gemeinsamer Machtzirkel / Institution', po.color, person);
            assigned = true;
            break;
          }
        }
        if (!assigned) {
          const firstOrg = person.memberships[0]?.organisation || 'Weitere Verwaltungsräte & Hochschulen';
          addMemberToCluster(
            'Weitere Verwaltungsräte & Universitäten',
            'Weitere Konzerne, Verbände & Universitäten',
            firstOrg,
            '#38bdf8',
            person
          );
        }
      }
    });

    let clusters = Object.values(clustersMap).sort((a, b) => b.members.length - a.members.length);
    if (activeClusterKey) {
      clusters = clusters.filter((c) => c.key === activeClusterKey);
    }

    // Compute SVG coordinates (1200 x 760 canvas)
    const width = 1200;
    const height = 760;
    const numClusters = clusters.length;

    const clusterCenters: Array<{
      cluster: ClusterDef;
      cx: number;
      cy: number;
      r: number;
    }> = [];

    if (numClusters === 1) {
      clusterCenters.push({
        cluster: clusters[0],
        cx: width / 2,
        cy: height / 2,
        r: 310
      });
    } else if (numClusters === 2) {
      clusterCenters.push(
        { cluster: clusters[0], cx: 340, cy: height / 2, r: 255 },
        { cluster: clusters[1], cx: 860, cy: height / 2, r: 255 }
      );
    } else if (numClusters <= 4) {
      const positions = [
        { cx: 330, cy: 215, r: 175 },
        { cx: 870, cy: 215, r: 175 },
        { cx: 330, cy: 555, r: 175 },
        { cx: 870, cy: 555, r: 175 }
      ];
      clusters.forEach((c, idx) => {
        clusterCenters.push({ cluster: c, ...positions[idx] });
      });
    } else {
      // Arrange up to 8 clusters in a 2-row or elliptical ring layout
      const cols = Math.ceil(numClusters / 2);
      const colSpacing = width / (cols + 0.4);
      clusters.forEach((c, idx) => {
        const row = idx < cols ? 0 : 1;
        const col = idx < cols ? idx : idx - cols;
        const cx = colSpacing * (col + 0.7);
        const cy = row === 0 ? 215 : 550;
        const r = Math.max(115, Math.min(155, 420 / cols));
        clusterCenters.push({ cluster: c, cx, cy, r });
      });
    }

    const nodePositions: Record<
      string,
      { person: ElitePerson; x: number; y: number; r: number; clusterColor: string; clusterKey: string }
    > = {};

    clusterCenters.forEach(({ cluster, cx, cy, r }) => {
      const members = cluster.members;
      const count = members.length;
      members.forEach((member, idx) => {
        // Concentric rings inside each cluster circle
        const baseNodeR = numClusters === 1 ? Math.min(34, Math.max(19, 14 + member.mandatesCount * 0.65)) : Math.min(25, Math.max(13, 10 + member.mandatesCount * 0.48));
        let nx = cx;
        let ny = cy;
        if (idx === 0 && count > 1) {
          nx = cx;
          ny = cy;
        } else if (count === 1) {
          nx = cx;
          ny = cy;
        } else {
          // Ring 1 holds up to 7 nodes, Ring 2 holds up to 14 nodes, Ring 3 holds remaining
          let ring = 1;
          let idxInRing = idx - 1;
          let nodesInRing = Math.min(7, count - 1);
          if (idx > 7 && idx <= 21) {
            ring = 2;
            idxInRing = idx - 8;
            nodesInRing = Math.min(14, count - 8);
          } else if (idx > 21) {
            ring = 3;
            idxInRing = idx - 22;
            nodesInRing = count - 22;
          }
          const maxRings = count > 21 ? 3 : count > 7 ? 2 : 1;
          const ringRadius = (r - baseNodeR - 14) * (ring / (maxRings + 0.15));
          const angle = (2 * Math.PI * idxInRing) / Math.max(1, nodesInRing) - Math.PI / 2;
          nx = cx + ringRadius * Math.cos(angle);
          ny = cy + ringRadius * Math.sin(angle);
        }
        nodePositions[member.id] = {
          person: member,
          x: nx,
          y: ny,
          r: baseNodeR,
          clusterColor: cluster.color,
          clusterKey: cluster.key
        };
      });
    });

    return { clusterCenters, nodePositions, width, height };
  }, [filteredElites, clusterGroupBy, activeClusterKey]);

  // Select default elite if none is selected or if current selection is filtered out
  useEffect(() => {
    if (filteredElites.length > 0) {
      if (!selectedElite || !filteredElites.some((e) => e.id === selectedElite.id)) {
        setSelectedElite(filteredElites[0]);
      }
    } else {
      setSelectedElite(null);
    }
  }, [filteredElites, selectedElite]);

  // Visible connection edges in SVG
  const visibleEdges = useMemo(() => {
    const focusId = hoveredEliteId || selectedElite?.id || null;
    return connectionsMap.edges.filter((edge) => {
      if (!circleLayout.nodePositions[edge.sourceId] || !circleLayout.nodePositions[edge.targetId]) {
        return false;
      }
      if (connectionMode === 'SELECTED_ONLY') {
        return focusId ? edge.sourceId === focusId || edge.targetId === focusId : false;
      }
      if (connectionMode === 'CROSS_SPHERE') {
        return edge.isCrossSphere;
      }
      if (connectionMode === 'SHARED_ORG' && filterOrganisation !== 'ALL') {
        return edge.sharedOrgs.includes(filterOrganisation);
      }
      return true;
    });
  }, [connectionsMap.edges, circleLayout.nodePositions, connectionMode, hoveredEliteId, selectedElite, filterOrganisation]);

  const activeCohortMeta = OBELIS_COHORT_INFO[selectedYear] || OBELIS_COHORT_INFO.ALL;

  // Full Dossier Subview (identical depth and style to DetailView.tsx for politicians!)
  if (fullDossierElite) {
    const person = fullDossierElite;
    const personConnections = connectionsMap.byPerson[person.id] || [];
    const linkedPol = person.politicianId ? politicians.find((p) => p.id === person.politicianId) : null;
    const gradeTheme = getGradeTheme(person.overallScore ?? null);

    return (
      <div className="detail-view-container">
        <div className="detail-nav-bar">
          <button onClick={() => setFullDossierElite(null)} className="back-button">
            <ArrowLeft size={16} />
            <span>ZURÜCK ZUM ELITEN-NETZWERK & KREISEN</span>
          </button>
        </div>

        <div className="detail-status-stripe">
          <div className="stripe-segment stripe-yellow"></div>
          <div className="stripe-segment stripe-green"></div>
          <div className="stripe-segment stripe-red"></div>
          <div className="stripe-segment stripe-green-dark"></div>
        </div>

        <div className="detail-content-grid">
          {/* Left Column: Biographical & Sociological Metadata */}
          <div className="detail-left-col">
            <div
              className="detail-portrait-container"
              style={{
                borderColor: SPHERE_META[person.primarySphere].color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#14161b'
              }}
            >
              {person.photo ? (
                <img
                  src={person.photo}
                  alt={person.fullName}
                  className="detail-portrait-img"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: '42px',
                    fontWeight: 900,
                    color: SPHERE_META[person.primarySphere].color,
                    letterSpacing: '2px'
                  }}
                >
                  {person.firstName[0]}
                  {person.lastName[0]}
                </div>
              )}
            </div>

            <h1 className="detail-name">{person.fullName}</h1>
            <div className="detail-council-title">
              {person.primaryRole} • {person.cantonName} ({person.canton})
            </div>

            {/* Sphere & Cohort Banner */}
            <div
              className="detail-score-banner"
              style={{
                backgroundColor: person.overallScore ? gradeTheme.bg : '#191b22',
                color: person.overallScore ? gradeTheme.text : '#ffffff',
                border: `1px solid ${SPHERE_META[person.primarySphere].color}`
              }}
            >
              <div className="detail-grade-num" style={{ fontSize: person.overallScore ? '32px' : '24px' }}>
                {person.overallScore ? person.overallScore.toFixed(1) : `${person.mandatesCount}`}
              </div>
              <div className="detail-grade-info">
                <div className="detail-grade-title">
                  {person.overallScore
                    ? `PROSCHWEIZ NOTE ${person.overallScore.toFixed(1)} • ${person.mandatesCount} MANDATE`
                    : `${person.mandatesCount} ERFASSTE MACHTPOSITIONEN & MANDATE`}
                </div>
                <div className="detail-grade-desc">
                  Sphären: {person.spheres.map((s) => SPHERE_META[s].short).join(' + ')} • OBELIS Stichjahre:{' '}
                  {person.cohortYears.join(', ')}
                </div>
              </div>
            </div>

            {linkedPol && (
              <button
                onClick={() => onSelectPolitician(linkedPol)}
                className="elites-jump-scorecard-btn"
              >
                <Award size={16} />
                <span>IM AKTUELLEN PARLAMENTS-SCORECARD-DOSSIER ÖFFNEN</span>
              </button>
            )}

            <div className="metadata-table">
              <div className="metadata-row">
                <span className="metadata-label">ELITEN-SPHÄREN</span>
                <span className="metadata-value" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {person.spheres.map((s) => (
                    <span
                      key={s}
                      className="elite-sphere-pill"
                      style={{ backgroundColor: SPHERE_META[s].bg, color: SPHERE_META[s].color, borderColor: SPHERE_META[s].color }}
                    >
                      {SPHERE_META[s].short}
                    </span>
                  ))}
                </span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">STICHJAHRE (KOHORTEN)</span>
                <span className="metadata-value">{person.cohortYears.join(' · ')}</span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">LEBENSDATEN</span>
                <span className="metadata-value">
                  *{person.birthYear} {person.deathYear ? `– †${person.deathYear}` : '(aktiv)'}
                </span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">KANTON / GEBURTSORT</span>
                <span className="metadata-value">
                  {person.cantonName} ({person.canton}) • {person.birthPlace}
                </span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">PARTEI / AUSRICHTUNG</span>
                <span className="metadata-value" style={{ color: person.partyColor || '#fff' }}>
                  {person.party} ({person.partyAbbr})
                </span>
              </div>

              <div className="metadata-divider"></div>

              <div className="metadata-row">
                <span className="metadata-label">PÄSSE / NATIONALITÄT</span>
                <span className="metadata-value">
                  {person.passports.map((p, idx) => (
                    <span key={idx} className="passport-pill">
                      {p === 'Schweiz' ? '🇨🇭' : '🌐'} {p}
                    </span>
                  ))}
                </span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">RELIGION / KONFESSION</span>
                <span className="metadata-value">{person.religion}</span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">MILITÄRISCHER GRAD</span>
                <span className="metadata-value">{person.militaryRank}</span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">UNIVERSITÄT / HOCHSCHULE</span>
                <span className="metadata-value">{person.university || 'Schweizer Hochschule'}</span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">FACHRICHTUNG</span>
                <span className="metadata-value">{person.studyField}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Memberships, Interlocks & OBELIS Source */}
          <div className="detail-right-col">
            <div className="dossier-hero-card">
              <div
                className="dossier-avatar-initials"
                style={{ backgroundColor: SPHERE_META[person.primarySphere].color }}
              >
                {person.firstName[0]}
                {person.lastName[0]}
              </div>
              <div className="dossier-hero-info">
                <h2 className="dossier-name">{person.fullName}</h2>
                <p className="dossier-lead">{person.bioSummary}</p>
              </div>
            </div>

            {/* Memberships & Mandates Table */}
            <div className="dossier-section-card">
              <div className="section-title-with-badge">
                <h3 className="dossier-section-title">
                  Mitgliedschaften, Verwaltungsräte, Verbände & Kommissionen
                </h3>
                <span className="interests-count-badge">
                  {person.memberships.length} Schlüssel-Mandate im Netzwerk
                </span>
              </div>
              <p className="interests-explainer">
                Klicke auf eine Institution oder Mitgliedschaft, um alle Schweizer Eliten anzuzeigen, die ebenfalls in diesem Gremium sitzen oder sassen.
              </p>

              <table className="dossier-table">
                <thead>
                  <tr>
                    <th>ORGANISATION / GREMIUM</th>
                    <th>KATEGORIE</th>
                    <th>SPHÄRE</th>
                    <th>FUNKTION</th>
                    <th>ZEITRAUM</th>
                  </tr>
                </thead>
                <tbody>
                  {person.memberships.map((m, idx) => (
                    <tr
                      key={idx}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setFilterOrganisation(m.organisation);
                        setFullDossierElite(null);
                      }}
                      title={`Alle Eliten in "${m.organisation}" filtern`}
                    >
                      <td className="font-bold" style={{ color: '#fff', textDecoration: 'underline', textDecorationColor: '#444' }}>
                        {m.organisation}
                      </td>
                      <td>{m.category}</td>
                      <td>
                        <span
                          className="elite-sphere-pill"
                          style={{
                            backgroundColor: SPHERE_META[m.sphere].bg,
                            color: SPHERE_META[m.sphere].color,
                            borderColor: SPHERE_META[m.sphere].color
                          }}
                        >
                          {SPHERE_META[m.sphere].short}
                        </span>
                      </td>
                      <td>
                        <span className="function-badge">{m.role}</span>
                      </td>
                      <td>{m.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Connected Elites in Network */}
            <div className="dossier-section-card">
              <div className="section-title-with-badge">
                <h3 className="dossier-section-title">
                  Direkte Verknüpfungen im Eliten-Netzwerk ({personConnections.length})
                </h3>
                <span className="seat-badge-highlight">Gemeinsame Räte, VR-Mandate & Clubs</span>
              </div>
              <p className="interests-explainer">
                Folgende Persönlichkeiten teilen mindestens eine Mitgliedschaft, ein Verwaltungsratsmandat, einen Verband oder eine Kommission mit {person.fullName}:
              </p>

              {personConnections.length === 0 ? (
                <p className="dossier-empty-note">
                  Keine direkten Überschneidungen in der aktuell gefilterten Stichprobe.
                </p>
              ) : (
                <div className="canton-members-grid">
                  {personConnections.map(({ other, sharedOrgs }) => (
                    <div
                      key={other.id}
                      className="canton-member-pill-card"
                      onClick={() => {
                        setSelectedElite(other);
                        setFullDossierElite(other);
                      }}
                    >
                      <span
                        className="member-party-badge"
                        style={{ backgroundColor: SPHERE_META[other.primarySphere].color }}
                      >
                        {other.primarySphere}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        <span className="member-name">{other.fullName}</span>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                          Gemeinsam: {sharedOrgs.slice(0, 2).join(', ')}
                        </span>
                      </div>
                      <span className="member-council-tag">{other.cohortYears[other.cohortYears.length - 1]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* External OBELIS Link */}
            <div className="dossier-section-card">
              <h3 className="dossier-section-title">Wissenschaftliche Quelle & OBELIS-Referenz</h3>
              <div className="dossier-contact-list">
                <div className="contact-item">
                  <ExternalLink size={15} className="contact-icon" />
                  <a
                    href={person.obelisUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dossier-link font-bold"
                  >
                    Original-Eintrag in der «Base de données des élites suisses» (OBELIS, Universität Lausanne) öffnen
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="elites-view-container">
      {/* Top Hero Banner with OBELIS Project Context */}
      <div className="zahlen-hero-section" style={{ marginBottom: '22px' }}>
        <div className="zahlen-badge-row">
          <span className="zahlen-ch-flag">🇨🇭</span>
          <span className="zahlen-hero-pill">
            OBELIS DATENBANK (UNIVERSITÄT LAUSANNE) · HISTORISCHE & AKTUELLE MACHTNETZWERKE (1890 – 2026)
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="zahlen-hero-title">SCHWEIZER ELITEN & MACHTZIRKEL</h1>
            <p className="zahlen-hero-lead" style={{ marginBottom: '0' }}>
              Interaktive Analyse der <strong>politischen, wirtschaftlichen, administrativen und akademischen Eliten</strong> der Schweiz von <strong>1890 bis 2026</strong> auf Basis des Forschungsprojekts{' '}
              <a
                href="https://elitessuisses.unil.ch/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#e5a93b', textDecoration: 'underline' }}
              >
                Observatoire des élites suisses (OBELIS, UNIL)
              </a>{' '}
              und der offiziellen Register der Interessenbindungen (Art. 11 ParlG). Klicke auf die <strong>Kreise</strong>, um Verflechtungen, Mitgliedschaften, Nationalitäten, Konfessionen und Militärgrade im Detail zu erkunden.
            </p>
          </div>
        </div>

        {/* Historical Cohort Timeline Strip (1890 - 2026) */}
        <div className="elites-timeline-bar">
          <div className="elites-timeline-label">EPOCHE / STICHJAHR WÄHLEN:</div>
          <div className="elites-timeline-buttons">
            {['ALL', '1890', '1910', '1937', '1957', '1980', '2000', '2010', '2015', '2020', '2026'].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`elites-year-btn ${selectedYear === yr ? 'active' : ''}`}
              >
                <span className="year-main">{yr === 'ALL' ? 'ALLE JAHRE' : yr === '2026' ? '2026 (AKTUELL)' : yr}</span>
                <span className="year-sub">
                  n={OBELIS_COHORT_INFO[yr]?.totalSample.toLocaleString('de-CH')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Epoch Summary Banner */}
        <div className="elites-epoch-banner">
          <div className="epoch-banner-left">
            <div className="epoch-title">{activeCohortMeta.title}</div>
            <p className="epoch-desc">{activeCohortMeta.summary}</p>
          </div>
          <div className="epoch-kpis">
            <div className="epoch-kpi-item" onClick={() => setFilterSphere(filterSphere === 'POL' ? 'ALL' : 'POL')} style={{ cursor: 'pointer' }}>
              <span className="epoch-kpi-num" style={{ color: SPHERE_META.POL.color }}>
                {activeCohortMeta.pol.toLocaleString('de-CH')}
              </span>
              <span className="epoch-kpi-lbl">Politik (POL)</span>
            </div>
            <div className="epoch-kpi-item" onClick={() => setFilterSphere(filterSphere === 'ECO' ? 'ALL' : 'ECO')} style={{ cursor: 'pointer' }}>
              <span className="epoch-kpi-num" style={{ color: SPHERE_META.ECO.color }}>
                {activeCohortMeta.eco.toLocaleString('de-CH')}
              </span>
              <span className="epoch-kpi-lbl">Wirtschaft (ECO)</span>
            </div>
            <div className="epoch-kpi-item" onClick={() => setFilterSphere(filterSphere === 'ADMIN' ? 'ALL' : 'ADMIN')} style={{ cursor: 'pointer' }}>
              <span className="epoch-kpi-num" style={{ color: SPHERE_META.ADMIN.color }}>
                {activeCohortMeta.admin.toLocaleString('de-CH')}
              </span>
              <span className="epoch-kpi-lbl">Verwaltung (ADMIN)</span>
            </div>
            <div className="epoch-kpi-item" onClick={() => setFilterSphere(filterSphere === 'ACAD' ? 'ALL' : 'ACAD')} style={{ cursor: 'pointer' }}>
              <span className="epoch-kpi-num" style={{ color: SPHERE_META.ACAD.color }}>
                {activeCohortMeta.acad.toLocaleString('de-CH')}
              </span>
              <span className="epoch-kpi-lbl">Akademie (ACAD)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Row: Search + View Mode Switcher + Filter Toggle */}
      <div className="controls-row">
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SUCHE NAME, VERWALTUNGSRAT, VERBAND (ECONOMIESUISSE, SNB, UBS, ZOFINGIA), PARTEI, KANTON, RELIGION, PASS..."
            className="search-input"
          />
        </div>

        <div className="view-toggle-group">
          <button
            onClick={() => setViewTab('CIRCLES')}
            className={`toggle-btn ${viewTab === 'CIRCLES' ? 'active' : ''}`}
          >
            <CircleDot size={15} />
            <span>KREISE & NETZWERK</span>
          </button>
          <button
            onClick={() => setViewTab('GROUPED_LIST')}
            className={`toggle-btn ${viewTab === 'GROUPED_LIST' ? 'active' : ''}`}
          >
            <LayoutGrid size={15} />
            <span>GRUPPIERTE LISTE ({filteredElites.length})</span>
          </button>
          <button
            onClick={() => setViewTab('OBELIS_STATS')}
            className={`toggle-btn ${viewTab === 'OBELIS_STATS' ? 'active' : ''}`}
          >
            <BarChart3 size={15} />
            <span>OBELIS STATISTIK (1890–2026)</span>
          </button>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`filters-btn ${showFilters ? 'active' : ''}`}
        >
          <SlidersHorizontal size={15} />
          <span>FILTERS {activeChips.length > 0 ? `(${activeChips.length})` : ''}</span>
        </button>
      </div>

      {/* Filter Shelf: Same parameters as Politicians + Elites-specific Spheres, Memberships, Military */}
      {showFilters && (
        <div className="filter-shelf">
          <div className="filter-select-wrapper">
            <select
              value={filterSphere}
              onChange={(e) => setFilterSphere(e.target.value)}
              className={`shelf-select ${filterSphere !== 'ALL' ? 'filter-active' : ''}`}
            >
              <option value="ALL">ELITEN-SPHÄRE (ALLE)</option>
              <option value="POL">Politische Elite (Bundesrat / Parlament / Kantone)</option>
              <option value="ECO">Wirtschaftliche Elite (Top-110 Konzerne & Verbände)</option>
              <option value="ADMIN">Administrative Elite (SNB / Ämter / Kommissionen)</option>
              <option value="ACAD">Akademische Elite (ETH / Universitäten)</option>
              <option value="MULTI">★ Mehrfach-Eliten (Politik ↔ Wirtschaft verflochten)</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={filterOrganisation}
              onChange={(e) => setFilterOrganisation(e.target.value)}
              className={`shelf-select ${filterOrganisation !== 'ALL' ? 'filter-active' : ''}`}
            >
              <option value="ALL">MITGLIEDSCHAFT / GREMIUM</option>
              {topOrganisations.map(([org, count]) => (
                <option key={org} value={org}>
                  {org} ({count})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={filterParty}
              onChange={(e) => setFilterParty(e.target.value)}
              className={`shelf-select ${filterParty !== 'ALL' ? 'filter-active' : ''}`}
            >
              <option value="ALL">PARTEI / FAMILIE</option>
              {partyOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={filterCanton}
              onChange={(e) => setFilterCanton(e.target.value)}
              className={`shelf-select ${filterCanton !== 'ALL' ? 'filter-active' : ''}`}
            >
              <option value="ALL">KANTON</option>
              {cantonOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={filterReligion}
              onChange={(e) => setFilterReligion(e.target.value)}
              className={`shelf-select ${filterReligion !== 'ALL' ? 'filter-active' : ''}`}
            >
              <option value="ALL">RELIGION / KONFESSION</option>
              {religionOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={filterNationality}
              onChange={(e) => setFilterNationality(e.target.value)}
              className={`shelf-select ${filterNationality !== 'ALL' ? 'filter-active' : ''}`}
            >
              <option value="ALL">PASS / NATIONALITÄT</option>
              <option value="Schweiz">🇨🇭 Schweiz</option>
              <option value="DUAL_FOREIGN">🌐 Doppelbürger / Ausländischer Pass</option>
              {nationalityOptions
                .filter((n) => n !== 'Schweiz')
                .map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={filterMilitary}
              onChange={(e) => setFilterMilitary(e.target.value)}
              className={`shelf-select ${filterMilitary !== 'ALL' ? 'filter-active' : ''}`}
            >
              <option value="ALL">MILITÄRGRAD</option>
              <option value="COLONEL_PLUS">Oberst / Brigadier / Divisionär / KKdt</option>
              <option value="OFFICER">Alle Offiziersgrade</option>
              <option value="NONE">Kein Offiziersgrad (Zivil)</option>
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="active-filter-chips-row">
          {activeChips.map((chip) => (
            <button key={chip.key} onClick={chip.onRemove} className="filter-chip-btn">
              <span>{chip.label}</span>
              <X size={13} className="chip-x-icon" />
            </button>
          ))}
          <button onClick={clearAllFilters} className="clear-all-filters-btn">
            CLEAR ALL
          </button>
        </div>
      )}

      {/* ==================== TAB 1: INTERACTIVE CIRCLES & NETWORK GRAPH ==================== */}
      {viewTab === 'CIRCLES' && (
        <div className="elites-circles-workspace">
          {/* Circle Grouping & Connection Controls Toolbar */}
          <div className="circles-toolbar">
            <div className="toolbar-group">
              <span className="toolbar-label">KREISE GRUPPIEREN NACH:</span>
              <div className="toolbar-pills">
                {(
                  [
                    { key: 'SPHERE', label: 'Eliten-Sphären (4 Sektoren)' },
                    { key: 'MEMBERSHIP', label: 'Mitgliedschaften & Machtzirkel' },
                    { key: 'PARTY', label: 'Partei & Ausrichtung' },
                    { key: 'RELIGION', label: 'Religion / Konfession' },
                    { key: 'NATIONALITY', label: 'Nationalität / Pass' },
                    { key: 'MILITARY', label: 'Militärgrad (Offiziere)' }
                  ] as Array<{ key: ClusterGroupBy; label: string }>
                ).map((g) => (
                  <button
                    key={g.key}
                    onClick={() => {
                      setClusterGroupBy(g.key);
                      setActiveClusterKey(null);
                    }}
                    className={`toolbar-pill-btn ${clusterGroupBy === g.key ? 'active' : ''}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="toolbar-group">
              <span className="toolbar-label">VERKNÜPFUNGSLINIEN:</span>
              <div className="toolbar-pills">
                {(
                  [
                    { key: 'ALL', label: `Alle Verbindungen (${connectionsMap.edges.length})` },
                    { key: 'CROSS_SPHERE', label: 'Sphären-Übergreifend (Politik ↔ Wirtschaft)' },
                    { key: 'SELECTED_ONLY', label: 'Nur ausgewählte Person' }
                  ] as Array<{ key: ConnectionMode; label: string }>
                ).map((cm) => (
                  <button
                    key={cm.key}
                    onClick={() => setConnectionMode(cm.key)}
                    className={`toolbar-pill-btn ${connectionMode === cm.key ? 'active' : ''}`}
                  >
                    {cm.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main 2-Column Interactive Split: Left SVG Circle Canvas, Right Live Inspector Panel */}
          <div className="circles-main-split">
            {/* Left: Interactive SVG Circle Cluster & Network Visualization */}
            <div className="circles-canvas-card">
              <div className="canvas-header-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <Network size={16} style={{ color: '#e5a93b' }} />
                  <span className="canvas-title">
                    INTERAKTIVE ELITEN-KREISE & VERFLECHTUNGS-NETZWERK
                  </span>
                  {activeClusterKey && (
                    <button
                      onClick={() => setActiveClusterKey(null)}
                      className="reset-zoom-btn"
                    >
                      <ArrowLeft size={13} />
                      <span>Alle Kreise anzeigen</span>
                    </button>
                  )}
                </div>
                <span className="canvas-hint">
                  Klicke auf einen grossen Gruppen-Kreis zum Hineinzoomen oder auf einen Personen-Kreis für Details & Verknüpfungen
                </span>
              </div>

              {filteredElites.length === 0 ? (
                <div className="empty-results-box" style={{ margin: '40px' }}>
                  Keine Eliten für die gewählten Filterkriterien gefunden.
                </div>
              ) : (
                <div className="svg-circle-wrapper">
                  <svg
                    viewBox={`0 0 ${circleLayout.width} ${circleLayout.height}`}
                    className="elites-network-svg"
                  >
                    <defs>
                      <radialGradient id="clusterGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.06" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
                      </radialGradient>
                    </defs>

                    {/* 1. Outer Cluster Circles */}
                    {circleLayout.clusterCenters.map(({ cluster, cx, cy, r }) => {
                      const isFocused = activeClusterKey === cluster.key;
                      return (
                        <g key={cluster.key} className="cluster-group-node">
                          <circle
                            cx={cx}
                            cy={cy}
                            r={r}
                            fill="url(#clusterGlow)"
                            stroke={cluster.color}
                            strokeWidth={isFocused ? 2.5 : 1.5}
                            strokeDasharray={isFocused ? 'none' : '6 4'}
                            strokeOpacity={0.65}
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              setActiveClusterKey(activeClusterKey === cluster.key ? null : cluster.key)
                            }
                          />
                          {/* Cluster Header Pill at top of big circle */}
                          <g
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              setActiveClusterKey(activeClusterKey === cluster.key ? null : cluster.key)
                            }
                          >
                            <rect
                              x={cx - Math.min(165, r * 0.85)}
                              y={cy - r - 15}
                              width={Math.min(330, r * 1.7)}
                              height={28}
                              rx={14}
                              fill="#111318"
                              stroke={cluster.color}
                              strokeWidth={1.5}
                            />
                            <text
                              x={cx}
                              y={cy - r + 3}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="11"
                              fontWeight="800"
                              letterSpacing="0.7px"
                            >
                              {cluster.title.toUpperCase()} ({cluster.members.length})
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {/* 2. Connection Lines (Verknüpfungen) between Elites */}
                    <g className="network-edges-layer">
                      {visibleEdges.map((edge) => {
                        const posA = circleLayout.nodePositions[edge.sourceId];
                        const posB = circleLayout.nodePositions[edge.targetId];
                        if (!posA || !posB) return null;

                        const focusId = hoveredEliteId || selectedElite?.id;
                        const isHighlighted =
                          focusId && (edge.sourceId === focusId || edge.targetId === focusId);

                        return (
                          <line
                            key={edge.id}
                            x1={posA.x}
                            y1={posA.y}
                            x2={posB.x}
                            y2={posB.y}
                            stroke={
                              isHighlighted
                                ? '#e5a93b'
                                : edge.isCrossSphere
                                ? 'rgba(230, 57, 70, 0.32)'
                                : 'rgba(148, 163, 184, 0.18)'
                            }
                            strokeWidth={isHighlighted ? 2.4 : edge.sharedOrgs.length > 1 ? 1.4 : 0.85}
                            strokeOpacity={
                              focusId
                                ? isHighlighted
                                  ? 0.95
                                  : 0.08
                                : 0.35
                            }
                          />
                        );
                      })}
                    </g>

                    {/* 3. Individual Clickable Elite Person Circles */}
                    <g className="network-nodes-layer">
                      {Object.values(circleLayout.nodePositions).map(({ person, x, y, r }) => {
                        const focusId = hoveredEliteId || selectedElite?.id;
                        const isSelected = selectedElite?.id === person.id;
                        const isHovered = hoveredEliteId === person.id;
                        const connectedToFocus =
                          focusId &&
                          (connectionsMap.byPerson[focusId] || []).some((c) => c.other.id === person.id);
                        const isMultiSphere = person.spheres.length > 1;
                        const sphereColor = SPHERE_META[person.primarySphere].color;
                        const dimmed = focusId && !isSelected && !isHovered && !connectedToFocus;

                        return (
                          <g
                            key={person.id}
                            transform={`translate(${x}, ${y})`}
                            style={{
                              cursor: 'pointer',
                              opacity: dimmed ? 0.32 : 1,
                              transition: 'opacity 0.2s ease'
                            }}
                            onClick={() => setSelectedElite(person)}
                            onDoubleClick={() => setFullDossierElite(person)}
                            onMouseEnter={() => setHoveredEliteId(person.id)}
                            onMouseLeave={() => setHoveredEliteId(null)}
                          >
                            {/* Outer ring for selected or multi-sphere interlock elites */}
                            {(isSelected || isHovered || isMultiSphere) && (
                              <circle
                                r={r + (isSelected ? 6 : 3.5)}
                                fill="none"
                                stroke={isSelected || isHovered ? '#ffffff' : '#e5a93b'}
                                strokeWidth={isSelected ? 2.5 : 1.5}
                                strokeDasharray={isSelected ? 'none' : '3 2'}
                              />
                            )}

                            {/* Main Person Circle */}
                            <circle
                              r={r}
                              fill={isSelected ? sphereColor : '#171920'}
                              stroke={sphereColor}
                              strokeWidth={isSelected ? 3 : 2}
                            />

                            {/* Initials inside Circle */}
                            <text
                              y={-1}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="#ffffff"
                              fontSize={Math.max(9, Math.min(13, r * 0.58))}
                              fontWeight="800"
                            >
                              {person.firstName[0]}
                              {person.lastName[0]}
                            </text>

                            {/* Sub-badge: number of mandates */}
                            <text
                              y={r * 0.52}
                              textAnchor="middle"
                              fill={isSelected ? '#ffffff' : '#cbd5e1'}
                              fontSize="7.5"
                              fontWeight="700"
                            >
                              {person.mandatesCount}M
                            </text>

                            {/* Name pill underneath circle */}
                            <text
                              y={r + 12}
                              textAnchor="middle"
                              fill={isSelected || isHovered || connectedToFocus ? '#ffffff' : '#9ca3af'}
                              fontSize={isSelected || isHovered ? '10.5' : '9'}
                              fontWeight={isSelected || isHovered || connectedToFocus ? '800' : '600'}
                            >
                              {person.lastName.length > 14 ? `${person.lastName.slice(0, 13)}.` : person.lastName}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>

                  {/* Legend Bar below SVG */}
                  <div className="circles-legend-bar">
                    <div className="legend-items">
                      {(['POL', 'ECO', 'ADMIN', 'ACAD'] as EliteSphere[]).map((s) => (
                        <div
                          key={s}
                          className="legend-item"
                          onClick={() => setFilterSphere(filterSphere === s ? 'ALL' : s)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="legend-dot" style={{ backgroundColor: SPHERE_META[s].color }} />
                          <span>{SPHERE_META[s].label}</span>
                        </div>
                      ))}
                      <div
                        className="legend-item"
                        onClick={() => setFilterSphere(filterSphere === 'MULTI' ? 'ALL' : 'MULTI')}
                        style={{ cursor: 'pointer' }}
                      >
                        <span
                          className="legend-dot"
                          style={{
                            backgroundColor: 'transparent',
                            border: '2px dashed #e5a93b'
                          }}
                        />
                        <span>Mehrfach-Elite (Schnittmenge Politik ↔ Wirtschaft)</span>
                      </div>
                    </div>
                    <div className="legend-note">
                      Kreisgrösse = Anzahl Mandate/Machtpositionen (`M`) • Goldene Linie = Gemeinsame Mitgliedschaft / VR / Kommission
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Live Detail Inspector for Selected Circle */}
            <div className="circles-inspector-card">
              {selectedElite ? (
                <>
                  <div className="inspector-top-header">
                    <div
                      className="inspector-avatar"
                      style={{ borderColor: SPHERE_META[selectedElite.primarySphere].color }}
                    >
                      {selectedElite.photo ? (
                        <img src={selectedElite.photo} alt={selectedElite.fullName} />
                      ) : (
                        <span>
                          {selectedElite.firstName[0]}
                          {selectedElite.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div className="inspector-title-col">
                      <div className="inspector-spheres-row">
                        {selectedElite.spheres.map((s) => (
                          <span
                            key={s}
                            className="elite-sphere-pill"
                            style={{
                              backgroundColor: SPHERE_META[s].bg,
                              color: SPHERE_META[s].color,
                              borderColor: SPHERE_META[s].color
                            }}
                          >
                            {SPHERE_META[s].short}
                          </span>
                        ))}
                        <span className="elite-year-tag">
                          {selectedElite.cohortYears.join(' · ')}
                        </span>
                      </div>
                      <h2 className="inspector-name">{selectedElite.fullName}</h2>
                      <div className="inspector-role">
                        {selectedElite.primaryRole} • {selectedElite.cantonName} ({selectedElite.canton})
                      </div>
                    </div>
                  </div>

                  {/* Quick Bio Grid (Same fields as Politicians: Nationality/Pass, Religion, Party, Military, University) */}
                  <div className="inspector-facts-grid">
                    <div className="inspector-fact">
                      <span className="if-label">NATIONALITÄT / PASS</span>
                      <span className="if-val">
                        {selectedElite.passports.map((p) => `${p === 'Schweiz' ? '🇨🇭' : '🌐'} ${p}`).join(', ')}
                      </span>
                    </div>
                    <div className="inspector-fact">
                      <span className="if-label">RELIGION / KONFESSION</span>
                      <span className="if-val">{selectedElite.religion}</span>
                    </div>
                    <div className="inspector-fact">
                      <span className="if-label">PARTEI / FAMILIE</span>
                      <span className="if-val" style={{ color: selectedElite.partyColor || '#fff' }}>
                        {selectedElite.partyAbbr} ({selectedElite.party})
                      </span>
                    </div>
                    <div className="inspector-fact">
                      <span className="if-label">MILITÄRGRAD</span>
                      <span className="if-val">{selectedElite.militaryRank}</span>
                    </div>
                    <div className="inspector-fact">
                      <span className="if-label">HOCHSCHULE / AUSBILDUNG</span>
                      <span className="if-val">{selectedElite.university}</span>
                    </div>
                    <div className="inspector-fact">
                      <span className="if-label">LEBENSDATEN & GEBURTSORT</span>
                      <span className="if-val">
                        *{selectedElite.birthYear}
                        {selectedElite.deathYear ? `–†${selectedElite.deathYear}` : ''} • {selectedElite.birthPlace}
                      </span>
                    </div>
                  </div>

                  {/* Memberships (Clickable pills to filter circles!) */}
                  <div className="inspector-section">
                    <div className="inspector-sec-header">
                      <span>MITGLIEDSCHAFTEN, VR & KOMMISSIONEN ({selectedElite.memberships.length})</span>
                      <span className="inspector-sec-sub">Klicken zum Filtern</span>
                    </div>
                    <div className="inspector-memberships-list">
                      {selectedElite.memberships.map((m, idx) => (
                        <div
                          key={idx}
                          className={`inspector-membership-item ${
                            filterOrganisation === m.organisation ? 'active' : ''
                          }`}
                          onClick={() =>
                            setFilterOrganisation(
                              filterOrganisation === m.organisation ? 'ALL' : m.organisation
                            )
                          }
                        >
                          <div className="im-main">
                            <span
                              className="im-dot"
                              style={{ backgroundColor: SPHERE_META[m.sphere].color }}
                            />
                            <span className="im-org">{m.organisation}</span>
                          </div>
                          <div className="im-meta">
                            <span>{m.role}</span>
                            <span>•</span>
                            <span>{m.period}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Direct Connections in Current Network */}
                  <div className="inspector-section">
                    <div className="inspector-sec-header">
                      <span>
                        VERKNÜPFUNGEN IM NETZWERK ({(connectionsMap.byPerson[selectedElite.id] || []).length})
                      </span>
                      <span className="inspector-sec-sub">Gemeinsame Gremien</span>
                    </div>
                    <div className="inspector-connections-list">
                      {(connectionsMap.byPerson[selectedElite.id] || []).slice(0, 8).map(({ other, sharedOrgs }) => (
                        <button
                          key={other.id}
                          onClick={() => setSelectedElite(other)}
                          className="inspector-conn-pill"
                        >
                          <span
                            className="conn-sphere-tag"
                            style={{ backgroundColor: SPHERE_META[other.primarySphere].color }}
                          >
                            {other.primarySphere}
                          </span>
                          <div className="conn-info">
                            <span className="conn-name">{other.fullName}</span>
                            <span className="conn-shared">{sharedOrgs.slice(0, 2).join(', ')}</span>
                          </div>
                          <ChevronRight size={14} />
                        </button>
                      ))}
                      {(connectionsMap.byPerson[selectedElite.id] || []).length === 0 && (
                        <div className="inspector-empty-conn">
                          Keine direkten Überschneidungen mit den aktuell sichtbaren Kreisen.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons: Full Dossier & Scorecard Jump */}
                  <div className="inspector-actions">
                    <button
                      onClick={() => setFullDossierElite(selectedElite)}
                      className="inspector-primary-btn"
                    >
                      <Sparkles size={15} />
                      <span>VOLLSTÄNDIGES ELITEN-DOSSIER ÖFFNEN</span>
                    </button>

                    {selectedElite.politicianId && (
                      <button
                        onClick={() => {
                          const pol = politicians.find((p) => p.id === selectedElite.politicianId);
                          if (pol) onSelectPolitician(pol);
                        }}
                        className="inspector-secondary-btn"
                      >
                        <Award size={15} />
                        <span>ZUM PROSCHWEIZ SCORECARD-PROFIL</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="inspector-empty">
                  Klicke links auf einen Kreis, um Biografie, Nationalität, Konfession, Mitgliedschaften und Verknüpfungen anzuzeigen.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: GROUPED ELITES CARDS (BY YEAR & SPHERE) ==================== */}
      {viewTab === 'GROUPED_LIST' && (
        <div className="elites-grouped-list-section">
          <div className="politicians-grid">
            {filteredElites.map((elite) => {
              const conns = connectionsMap.byPerson[elite.id] || [];
              const meta = SPHERE_META[elite.primarySphere];
              return (
                <div
                  key={elite.id}
                  className="card-container elite-card-container"
                  onClick={() => {
                    setSelectedElite(elite);
                    setFullDossierElite(elite);
                  }}
                >
                  <div className="card-top">
                    <div
                      className="card-avatar-wrapper"
                      style={{
                        borderColor: meta.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#14161b'
                      }}
                    >
                      {elite.photo ? (
                        <img
                          src={elite.photo}
                          alt={elite.fullName}
                          className="card-avatar-img"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span style={{ fontWeight: 900, fontSize: '18px', color: meta.color }}>
                          {elite.firstName[0]}
                          {elite.lastName[0]}
                        </span>
                      )}
                    </div>

                    <div className="card-info">
                      <div className="card-location-badge" style={{ flexWrap: 'wrap', gap: '6px' }}>
                        <span className="card-canton">
                          {elite.cantonName} ({elite.canton})
                        </span>
                        <span
                          className="card-party-tag"
                          style={{ backgroundColor: elite.partyColor || '#333' }}
                        >
                          {elite.partyAbbr}
                        </span>
                        {elite.spheres.map((s) => (
                          <span
                            key={s}
                            className="elite-sphere-pill"
                            style={{
                              backgroundColor: SPHERE_META[s].bg,
                              color: SPHERE_META[s].color,
                              borderColor: SPHERE_META[s].color
                            }}
                          >
                            {SPHERE_META[s].short}
                          </span>
                        ))}
                      </div>
                      <h3 className="card-name">{elite.fullName}</h3>
                      <div className="card-title-role">
                        <span className="card-role">
                          *{elite.birthYear}
                          {elite.deathYear ? `–†${elite.deathYear}` : ''} • Stichjahre:{' '}
                          {elite.cohortYears.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio Attributes Row: Passports, Religion, Military Rank */}
                  <div className="elite-card-attributes">
                    <span className="elite-attr-pill">
                      {elite.passports.includes('Schweiz') ? '🇨🇭' : '🌐'} {elite.passports.join(' + ')}
                    </span>
                    <span className="elite-attr-pill">⛪ {elite.religion}</span>
                    {elite.militaryRank !== 'Kein Offiziersgrad' && (
                      <span className="elite-attr-pill">⚔️ {elite.militaryRank}</span>
                    )}
                  </div>

                  {/* Top Memberships Preview */}
                  <div className="elite-card-memberships">
                    {elite.memberships.slice(0, 4).map((m, idx) => (
                      <span
                        key={idx}
                        className="elite-mem-chip"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setFilterOrganisation(m.organisation);
                        }}
                      >
                        {m.organisation}
                      </span>
                    ))}
                    {elite.memberships.length > 4 && (
                      <span className="elite-mem-chip more">+{elite.memberships.length - 4} weitere</span>
                    )}
                  </div>

                  {/* Bottom Banner: Mandates & Network Connections Count */}
                  <div
                    className="card-score-banner"
                    style={{
                      backgroundColor: '#13151b',
                      borderTop: `2px solid ${meta.color}`,
                      color: '#ffffff'
                    }}
                  >
                    <div className="card-grade-badge" style={{ fontSize: '24px', color: meta.color }}>
                      {elite.mandatesCount}
                    </div>
                    <div className="card-score-details">
                      <div className="card-score-count">
                        {elite.mandatesCount} Mandate • {conns.length} Netzwerk-Verknüpfungen
                      </div>
                      <div className="card-score-sub">
                        {elite.university} • Klicken für Eliten-Dossier
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: OBELIS HISTORICAL EVOLUTION & STATISTICS (1890-2026) ==================== */}
      {viewTab === 'OBELIS_STATS' && (
        <div className="elites-stats-section">
          {/* 1. Longitudinal Table 1890 - 2020 */}
          <div className="dossier-section-card" style={{ marginBottom: '24px' }}>
            <div className="section-title-with-badge">
              <h3 className="dossier-section-title">
                Historische Entwicklung der Schweizer Eliten (1890 – 2020 · OBELIS / UNIL)
              </h3>
              <span className="interests-count-badge">Offizielle Zeitreihe · 9 Referenzstichjahre</span>
            </div>
            <p className="interests-explainer">
              Vom national geschlossenen, militärisch-freisinnigen Miliz-Netzwerk («Alpenfestung» 1937–1980) zur stark internationalisierten Konzern- und Wissenschaftselite ab 2000. Klicke auf ein Stichjahr, um die Eliten dieses Jahres zu filtern.
            </p>

            <table className="dossier-table">
              <thead>
                <tr>
                  <th>STICHJAHR</th>
                  <th>POLITIK (POL)</th>
                  <th>WIRTSCHAFT (ECO)</th>
                  <th>VERWALTUNG (ADMIN)</th>
                  <th>AKADEMIE (ACAD)</th>
                  <th>AUSLÄNDERANTEIL WIRTSCHAFT</th>
                  <th>AUSLÄNDERANTEIL UNIVERSITÄTEN</th>
                  <th>OFFIZIERSQUOTE (MILIZ)</th>
                  <th>FRAUENANTEIL POLITIK</th>
                </tr>
              </thead>
              <tbody>
                {OBELIS_HISTORICAL_SERIES.map((row) => (
                  <tr
                    key={row.year}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedYear(String(row.year));
                      setViewTab('CIRCLES');
                    }}
                  >
                    <td className="font-bold" style={{ color: '#e5a93b' }}>
                      {row.year}
                    </td>
                    <td>{row.polTotal.toLocaleString('de-CH')}</td>
                    <td>{row.ecoTotal.toLocaleString('de-CH')}</td>
                    <td>{row.adminTotal.toLocaleString('de-CH')}</td>
                    <td>{row.acadTotal.toLocaleString('de-CH')}</td>
                    <td style={{ color: row.ecoForeignPct > 25 ? '#e63946' : '#fff', fontWeight: 700 }}>
                      {row.ecoForeignPct.toFixed(1)} %
                    </td>
                    <td style={{ color: row.acadForeignPct > 25 ? '#e5a93b' : '#fff', fontWeight: 700 }}>
                      {row.acadForeignPct.toFixed(1)} %
                    </td>
                    <td style={{ color: '#0094eb', fontWeight: 700 }}>{row.officerPct.toFixed(1)} %</td>
                    <td>{row.polFemalePct.toFixed(1)} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. Economic Sectors & Military Ranks Grid */}
          <div className="elites-stats-two-col">
            <div className="dossier-section-card">
              <h3 className="dossier-section-title">
                Wirtschaftliche Eliten nach Sektor (Mandate in den Top-110 Unternehmen)
              </h3>
              <p className="interests-explainer">
                Banken, Finanzgesellschaften (`BQSF`), Versicherungen (`ASSR`) und die Maschinen-, Elektro- und Metallindustrie (`MEM`) stellen historisch das Rückgrat der Schweizer Wirtschaftselite.
              </p>
              <div className="elites-bars-list">
                {OBELIS_ECO_SECTORS.map((sec) => {
                  const pct = Math.round((sec.mandates / 3837) * 100);
                  return (
                    <div key={sec.code} className="elite-bar-row">
                      <div className="elite-bar-header">
                        <span className="font-bold">
                          [{sec.code}] {sec.name}
                        </span>
                        <span style={{ color: sec.color, fontWeight: 800 }}>
                          {sec.mandates.toLocaleString('de-CH')} Mandate
                        </span>
                      </div>
                      <div className="elite-bar-track">
                        <div
                          className="elite-bar-fill"
                          style={{ width: `${pct}%`, backgroundColor: sec.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dossier-section-card">
              <h3 className="dossier-section-title">
                Militärische Offiziersgrade nach Eliten-Sphäre (OBELIS Gesamtbestand)
              </h3>
              <p className="interests-explainer">
                Der Rang des <strong>Obersten (Colonel)</strong> war über Jahrzehnte das zentrale Verbindungsglied zwischen Wirtschaftsführern, Bundespolitikern und hohen Beamten.
              </p>
              <table className="dossier-table">
                <thead>
                  <tr>
                    <th>SPHÄRE</th>
                    <th>OBERST (COLONEL)</th>
                    <th>BRIGADIER / DIV. / KKDT</th>
                    <th>MAJOR</th>
                    <th>HAUPTMANN</th>
                    <th>OBLT / LT</th>
                  </tr>
                </thead>
                <tbody>
                  {OBELIS_MILITARY_BY_SPHERE.map((m) => (
                    <tr key={m.sphere}>
                      <td className="font-bold">{m.sphere}</td>
                      <td style={{ color: '#e5a93b', fontWeight: 800 }}>
                        {m.colonel.toLocaleString('de-CH')}
                      </td>
                      <td style={{ color: '#e63946', fontWeight: 700 }}>
                        {m.general.toLocaleString('de-CH')}
                      </td>
                      <td>{m.major.toLocaleString('de-CH')}</td>
                      <td>{m.captain.toLocaleString('de-CH')}</td>
                      <td>{m.lieutenant.toLocaleString('de-CH')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '22px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '10px', color: '#e5a93b' }}>
                  TOP VERFLECHTUNGS-INSTITUTIONEN (BRÜCKEN ZWISCHEN POLITIK & WIRTSCHAFT)
                </h4>
                <div className="inspector-memberships-list">
                  {topOrganisations.slice(0, 10).map(([org, count]) => (
                    <div
                      key={org}
                      className="inspector-membership-item"
                      onClick={() => {
                        setFilterOrganisation(org);
                        setViewTab('CIRCLES');
                      }}
                    >
                      <div className="im-main">
                        <span className="im-dot" style={{ backgroundColor: '#e5a93b' }} />
                        <span className="im-org">{org}</span>
                      </div>
                      <div className="im-meta">
                        <span>{count} Eliten im Index • Im Kreis-Netzwerk anzeigen →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
