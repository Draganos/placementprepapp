import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UserProfile } from '@/types/database';
import { ProfileForm } from '@/components/settings/ProfileForm';

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users_profile')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your profile is used to personalise AI insights.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold mb-5">Student Profile</h2>
        <ProfileForm
          initialData={(profile as UserProfile) ?? undefined}
          userEmail={user.email ?? ''}
        />
      </div>
    </div>
  );
}
