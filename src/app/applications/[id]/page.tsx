import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, ExternalLink } from 'lucide-react';
import { Application, ApplicationEvent, CvVersion } from '@/types/database';
import { StatusBadge } from '@/components/applications/StatusBadge';
import { formatDate } from '@/lib/utils';
import { AddEventForm } from '@/components/applications/AddEventForm';

export default async function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: app } = await supabase
    .from('applications')
    .select('*, cv_versions(version_name)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!app) notFound();

  const { data: events } = await supabase
    .from('application_events')
    .select('*')
    .eq('application_id', params.id)
    .order('event_date', { ascending: true });

  const application = app as Application;
  const timeline = (events as ApplicationEvent[]) ?? [];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/applications"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> All applications
        </Link>
        <div className="flex items-center gap-2">
          {application.job_url && (
            <a
              href={application.job_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink size={14} /> Job Posting
            </a>
          )}
          <Link
            href={`/applications/${params.id}/edit`}
            className="flex items-center gap-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Pencil size={14} /> Edit
          </Link>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl font-bold shrink-0">
              {application.company_name[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold">{application.company_name}</h1>
              <p className="text-muted-foreground text-sm">{application.role_title}</p>
            </div>
          </div>
          <StatusBadge status={application.status} className="mt-1" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Sector',   value: application.sector         ?? '—' },
            { label: 'Location', value: application.location       ?? '—' },
            { label: 'Applied',  value: formatDate(application.application_date) },
            { label: 'Deadline', value: formatDate(application.deadline) },
          ].map((d) => (
            <div key={d.label}>
              <p className="text-xs text-muted-foreground">{d.label}</p>
              <p className="text-sm font-medium mt-0.5">{d.value}</p>
            </div>
          ))}
        </div>

        {(application.salary_range || application.source || (application as any).cv_versions?.version_name) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
            {application.salary_range && (
              <div>
                <p className="text-xs text-muted-foreground">Salary</p>
                <p className="text-sm font-medium mt-0.5">{application.salary_range}</p>
              </div>
            )}
            {application.source && (
              <div>
                <p className="text-xs text-muted-foreground">Found via</p>
                <p className="text-sm font-medium mt-0.5">{application.source}</p>
              </div>
            )}
            {(application as any).cv_versions?.version_name && (
              <div>
                <p className="text-xs text-muted-foreground">CV Version</p>
                <p className="text-sm font-medium mt-0.5">{(application as any).cv_versions.version_name}</p>
              </div>
            )}
          </div>
        )}

        {application.notes && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{application.notes}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold mb-4">Application Timeline</h2>

        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {timeline.map((event, i) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className="relative flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                  {i < timeline.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-1" style={{ minHeight: 24 }} />
                  )}
                </div>
                <div className="pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{event.event_type}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(event.event_date)}</span>
                  </div>
                  {event.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{event.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-border">
          <AddEventForm applicationId={params.id} />
        </div>
      </div>
    </div>
  );
}
