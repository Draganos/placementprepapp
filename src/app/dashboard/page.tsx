import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id ?? '');

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to your dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Phase 1 is complete when auth and protected routes work consistently.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="text-sm font-medium mt-2 break-all">{user?.email}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Applications tracked</p>
          <p className="text-3xl font-semibold mt-2">{count ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Next milestone</p>
          <p className="text-sm font-medium mt-2">Create your first application entry</p>
        </div>
      </div>

      <section className="rounded-xl border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Phase 1 checklist</h2>
        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
          <li>Supabase project variables configured via <code>.env.local</code>.</li>
          <li>User can sign up and sign in with Supabase Auth.</li>
          <li>Protected pages redirect unauthenticated users to login.</li>
          <li>Authenticated users can access dashboard and core app routes.</li>
        </ul>
        <Link href="/applications/new" className="inline-block text-sm text-blue-600 hover:underline">
          Continue to Phase 2 → Add first application
        </Link>
      </section>
    </div>
  );
}
