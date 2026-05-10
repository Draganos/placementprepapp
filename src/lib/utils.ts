import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { ApplicationStatus, AnalyticsSummary, Application } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  try {
    return format(new Date(date), 'd MMM yyyy');
  } catch {
    return '—';
  }
}

export function formatRelative(date: string | null | undefined): string {
  if (!date) return '—';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '—';
  }
}

export function daysUntilDeadline(deadline: string | null | undefined): number | null {
  if (!deadline) return null;
  try {
    return differenceInDays(new Date(deadline), new Date());
  } catch {
    return null;
  }
}

// Compute analytics from an array of applications
export function computeAnalytics(applications: Application[]): AnalyticsSummary {
  const total = applications.length;

  const statusCounts: Record<string, number> = {};
  applications.forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });

  const offers     = statusCounts['Offer'] || 0;
  const rejections = (statusCounts['Rejected'] || 0) + (statusCounts['Ghosted'] || 0);
  const active     = total - offers - rejections - (statusCounts['Withdrawn'] || 0);

  const applied       = total - (statusCounts['Saved'] || 0);
  const oa            = (statusCounts['Online Assessment'] || 0)
                      + (statusCounts['Interview'] || 0)
                      + (statusCounts['Assessment Centre'] || 0)
                      + offers;
  const interviews    = (statusCounts['Interview'] || 0)
                      + (statusCounts['Assessment Centre'] || 0)
                      + offers;
  const assessments   = (statusCounts['Assessment Centre'] || 0) + offers;

  const responseRate         = applied > 0 ? Math.round((oa / applied) * 100)         : 0;
  const interviewConversionRate = oa > 0   ? Math.round((interviews / oa) * 100)      : 0;
  const offerConversionRate  = applied > 0 ? Math.round((offers / applied) * 100)     : 0;

  // Funnel
  const funnel = [
    { stage: 'Applied',           count: applied,     rate: 100 },
    { stage: 'Online Assessment', count: oa,          rate: applied > 0 ? Math.round((oa / applied) * 100) : 0 },
    { stage: 'Interview',         count: interviews,  rate: applied > 0 ? Math.round((interviews / applied) * 100) : 0 },
    { stage: 'Assessment Centre', count: assessments, rate: applied > 0 ? Math.round((assessments / applied) * 100) : 0 },
    { stage: 'Offer',             count: offers,      rate: applied > 0 ? Math.round((offers / applied) * 100) : 0 },
  ];

  // By sector
  const sectorMap: Record<string, { count: number; offers: number; interviews: number }> = {};
  applications.forEach((a) => {
    const s = a.sector || 'Unknown';
    if (!sectorMap[s]) sectorMap[s] = { count: 0, offers: 0, interviews: 0 };
    sectorMap[s].count++;
    if (a.status === 'Offer') sectorMap[s].offers++;
    if (['Interview', 'Assessment Centre', 'Offer'].includes(a.status)) sectorMap[s].interviews++;
  });
  const bySector = Object.entries(sectorMap)
    .map(([sector, v]) => ({ sector, ...v }))
    .sort((a, b) => b.count - a.count);

  // By week (last 12 weeks)
  const weekMap: Record<string, number> = {};
  applications.forEach((a) => {
    if (!a.application_date) return;
    try {
      const weekKey = format(new Date(a.application_date), 'dd MMM');
      weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
    } catch {
      // skip
    }
  });
  const byWeek = Object.entries(weekMap)
    .map(([week, applications]) => ({ week, applications }))
    .slice(-12);

  return {
    total,
    active,
    offers,
    rejections,
    responseRate,
    interviewConversionRate,
    offerConversionRate,
    avgResponseDays: null,
    funnel,
    bySector,
    byWeek,
  };
}

export function getDeadlineUrgency(deadline: string | null): 'overdue' | 'urgent' | 'soon' | 'ok' | null {
  const days = daysUntilDeadline(deadline);
  if (days === null) return null;
  if (days < 0) return 'overdue';
  if (days <= 2) return 'urgent';
  if (days <= 7) return 'soon';
  return 'ok';
}
