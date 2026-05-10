import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ApplicationForm } from '@/components/applications/ApplicationForm';
import { CvVersion } from '@/types/database';

export default async function NewApplicationPage() {
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

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Application</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Log a new placement or internship application.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <ApplicationForm
          mode="create"
          cvVersions={(cvVersions as CvVersion[]) ?? []}
        />
      </div>
    </div>
  );
}
