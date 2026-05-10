import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch profile for sidebar
  const { data: profile } = await supabase
    .from('users_profile')
    .select('full_name')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        userEmail={user.email}
        userName={profile?.full_name ?? undefined}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
