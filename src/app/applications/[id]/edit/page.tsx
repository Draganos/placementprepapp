import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ApplicationForm } from '@/components/applications/ApplicationForm';
import { Application, CvVersion } from '@/types/database';

export default async function EditApplicationPage({
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
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!app) notFound();

  const { data: cvVersions } = await supabase
    .from('cv_versions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Application</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {app.company_name} — {app.role_title}
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <ApplicationForm
          mode="edit"
          initialData={app as Application}
          applicationId={params.id}
          cvVersions={(cvVersions as CvVersion[]) ?? []}
        />
      </div>
    </div>
  );
}
