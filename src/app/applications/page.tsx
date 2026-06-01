import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ApplicationsTable } from '@/components/ApplicationsTable';
import { Application, CvVersion } from '@/types/database';

export default async function ApplicationsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: applications, error: applicationsError } = await supabase
    .from('applications')
    .select('*, cv_versions(version_name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: cvVersions, error: cvVersionsError } = await supabase
    .from('cv_versions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });



  if (applicationsError || cvVersionsError) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <p className="text-sm text-red-600">
          Failed to load applications data: {applicationsError?.message ?? cvVersionsError?.message}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {applications?.length ?? 0} total application
            {(applications?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/applications/new"
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Application
        </Link>
      </div>

      <ApplicationsTable
        applications={(applications as Application[]) ?? []}
        cvVersions={(cvVersions as CvVersion[]) ?? []}
      />
    </div>
  );
}
