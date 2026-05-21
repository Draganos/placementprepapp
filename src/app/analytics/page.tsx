import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Application } from '@/types/database';
import { computeAnalytics } from '@/lib/utils';
import { FunnelChart } from '@/components/analytics/FunnelChart';
import { SectorChart } from '@/components/analytics/SectorChart';
import { WeeklyChart } from '@/components/analytics/WeeklyChart';

export default async function AnalyticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: applications, error: applicationsError } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id);

  if (applicationsError) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">Failed to load analytics: {applicationsError.message}</p>
      </div>
    );
  }

  const apps = (applications as Application[]) ?? [];
  const stats = computeAnalytics(apps);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your placement application funnel and performance.
        </p>
      </div>

      {apps.length < 3 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-800 text-sm font-medium">Not enough data yet</p>
          <p className="text-amber-700 text-sm mt-1">
            Add at least 3 applications to start seeing meaningful analytics.
          </p>
        </div>
      ) : (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Response Rate',        value: `${stats.responseRate}%`,            sub: 'Applied → OA/Interview' },
              { label: 'Interview Conversion',  value: `${stats.interviewConversionRate}%`, sub: 'OA → Interview' },
              { label: 'Offer Rate',            value: `${stats.offerConversionRate}%`,     sub: 'Applied → Offer' },
              { label: 'Total Applications',   value: stats.total,                          sub: `${stats.active} active` },
            ].map((m) => (
              <div key={m.label} className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-3xl font-bold mt-1">{m.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
              </div>
            ))}
          </div>

          {/* Funnel + Weekly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-sm font-semibold mb-5">Application Funnel</h2>
              <FunnelChart data={stats.funnel} />
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-sm font-semibold mb-5">Applications per Week</h2>
              <WeeklyChart data={stats.byWeek} />
            </div>
          </div>

          {/* Sector breakdown */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold mb-5">Performance by Sector</h2>
            <SectorChart data={stats.bySector} />
          </div>
        </>
      )}
    </div>
  );
}
