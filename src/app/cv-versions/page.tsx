import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CvVersion, Application } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { CreateCvVersionForm } from '@/components/cv/CreateCvVersionForm';
import { FileText, CheckCircle } from 'lucide-react';

export default async function CvVersionsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: cvVersions } = await supabase
    .from('cv_versions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: applications } = await supabase
    .from('applications')
    .select('cv_version_id, status, company_name')
    .eq('user_id', user.id);

  const versions = (cvVersions as CvVersion[]) ?? [];
  const apps = (applications as Partial<Application>[]) ?? [];

  // Compute per-version stats
  const versionStats = versions.map((v) => {
    const vApps = apps.filter((a) => a.cv_version_id === v.id);
    const offers = vApps.filter((a) => a.status === 'Offer').length;
    const interviews = vApps.filter((a) =>
      ['Interview', 'Assessment Centre', 'Offer'].includes(a.status ?? '')
    ).length;
    return { ...v, appCount: vApps.length, offers, interviews };
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CV Versions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track which CV version you used for each application and compare outcomes.
        </p>
      </div>

      {/* Create form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold mb-4">Add CV Version</h2>
        <CreateCvVersionForm />
      </div>

      {/* Versions list */}
      {versionStats.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No CV versions yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">{versions.length} CV version{versions.length !== 1 ? 's' : ''}</h2>
          </div>
          <div className="divide-y divide-border">
            {versionStats.map((v) => (
              <div key={v.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{v.version_name}</p>
                    {v.is_active && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </div>
                  {v.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{v.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Created {formatDate(v.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-center shrink-0">
                  <div>
                    <p className="text-lg font-bold">{v.appCount}</p>
                    <p className="text-xs text-muted-foreground">Applications</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">{v.interviews}</p>
                    <p className="text-xs text-muted-foreground">Interviews</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{v.offers}</p>
                    <p className="text-xs text-muted-foreground">Offers</p>
                  </div>
                  {v.file_url && (
                    <a
                      href={v.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      View PDF
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
