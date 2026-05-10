// ============================================================
// PlacementPrep — Database Types
// ============================================================

export type ApplicationStatus =
  | 'Saved'
  | 'Applied'
  | 'Online Assessment'
  | 'Interview'
  | 'Assessment Centre'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn'
  | 'Ghosted';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Saved',
  'Applied',
  'Online Assessment',
  'Interview',
  'Assessment Centre',
  'Offer',
  'Rejected',
  'Withdrawn',
  'Ghosted',
];

export const STATUS_COLOURS: Record<ApplicationStatus, string> = {
  Saved:               'bg-slate-100 text-slate-700',
  Applied:             'bg-blue-100 text-blue-700',
  'Online Assessment': 'bg-yellow-100 text-yellow-700',
  Interview:           'bg-purple-100 text-purple-700',
  'Assessment Centre': 'bg-orange-100 text-orange-700',
  Offer:               'bg-green-100 text-green-700',
  Rejected:            'bg-red-100 text-red-700',
  Withdrawn:           'bg-gray-100 text-gray-500',
  Ghosted:             'bg-zinc-100 text-zinc-500',
};

export const SECTORS = [
  'Technology',
  'Finance',
  'Consulting',
  'Engineering',
  'Healthcare',
  'Legal',
  'Marketing',
  'Retail',
  'Automotive',
  'Energy',
  'Government',
  'Non-profit',
  'Other',
] as const;

export type Sector = (typeof SECTORS)[number];

// ---- Database row types ----

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  university: string | null;
  degree: string | null;
  graduation_year: number | null;
  target_roles: string[] | null;
  target_sectors: string[] | null;
  skills: string[] | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CvVersion {
  id: string;
  user_id: string;
  version_name: string;
  file_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  company_name: string;
  role_title: string;
  sector: string | null;
  location: string | null;
  application_date: string | null;
  deadline: string | null;
  status: ApplicationStatus;
  source: string | null;
  cv_version_id: string | null;
  job_url: string | null;
  salary_range: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  cv_versions?: CvVersion | null;
}

export interface ApplicationEvent {
  id: string;
  application_id: string;
  user_id: string;
  event_type: ApplicationStatus | 'Note Added' | 'Deadline Set';
  event_date: string;
  notes: string | null;
  created_at: string;
}

export interface AiInsight {
  id: string;
  user_id: string;
  summary: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  next_steps: string[] | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

// ---- Analytics helpers ----

export interface FunnelData {
  stage: string;
  count: number;
  rate: number;
}

export interface SectorData {
  sector: string;
  count: number;
  offers: number;
  interviews: number;
}

export interface WeeklyData {
  week: string;
  applications: number;
}

export interface AnalyticsSummary {
  total: number;
  active: number;
  offers: number;
  rejections: number;
  responseRate: number;
  interviewConversionRate: number;
  offerConversionRate: number;
  avgResponseDays: number | null;
  funnel: FunnelData[];
  bySector: SectorData[];
  byWeek: WeeklyData[];
}
