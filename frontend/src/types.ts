export interface BillVote {
  id: string;
  businessNumber: string;
  title: string;
  date: string;
  session?: string;
  subject: string;
  summary: string;
  decision: string;
  sourceUrl: string;
  politicianPosition: string; // 'Ja' | 'Nein' | 'Enthaltung' | 'Hat nicht teilgenommen'
  rating: string; // '+5' | '-1' | '-5' | 'Exekutive' | 'Ungraded'
  targetPosition?: string;
  alignment?: 'Aligned' | 'Opposed' | 'Abstained' | 'Executive' | 'President' | 'Neutral';
}

export interface Politician {
  id: string;
  personNumber: number;
  personIdCode: number;
  firstName: string;
  lastName: string;
  fullName: string;
  council: 'Bundesrat' | 'Nationalrat' | 'Ständerat';
  councilAbbr: 'BR' | 'NR' | 'SR';
  canton: string;
  cantonName: string;
  party: string;
  partyAbbr: string;
  partyColor: string;
  photo: string;
  inOfficeSince: string;
  termEnds: string;
  seat: string;
  department?: string;
  birthPlace: string;
  citizenship: string;
  passports: string[];
  religion: string;
  overallScore: number | null; // Swiss Grade (1.0 to 6.0)
  scorePoints?: number | null;
  actionsAligned?: number;
  actionsTotal?: number;
  alignedCount: number;
  totalVotes: number;
  isPresident?: boolean;
  status: string;
  birthYear?: number;
  seatNumber?: number;
  inCouncilSince?: string;
  groupId?: number;
  groupName?: string;
  groupColour?: string;
  groupFunction?: string;
  email?: string;
  parliamentProfileUrl?: string;
  career?: Array<{ council: string; from: string; to: string | null; canton: string; parties: string[] }>;
  occupations?: Array<{ occupation: string; employer: string | null; job_title: string | null; since: string }>;
  committees?: Array<{ number: number; name: string; abbr: string; function: string; function_code: number }>;
  interests?: Array<{ organisation: string; legal_form: string; body: string | null; function: string; paid: boolean }>;
  votingRecord?: { legislature: number; votes: number; yes: number; no: number; abstain: number; excused: number; did_not_vote: number; presiding: number; participation_pct: number; group_agreement_pct: number; group_agreement_base: number; from: string; to: string };
  votingRecordEarlier?: Record<string, { votes: number; participation_pct: number; group_agreement_pct: number; from: string; to: string }>;
  recentVotes: BillVote[];
}
