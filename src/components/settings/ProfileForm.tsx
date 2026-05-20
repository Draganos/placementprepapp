'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, SECTORS } from '@/types/database';

interface ProfileFormProps {
  initialData?: UserProfile;
  userEmail: string;
}

const CURRENT_YEAR = new Date().getFullYear();
const GRAD_YEARS = [CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2, CURRENT_YEAR + 3];

export function ProfileForm({ initialData, userEmail }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    full_name:       initialData?.full_name       ?? '',
    university:      initialData?.university      ?? '',
    degree:          initialData?.degree          ?? '',
    graduation_year: initialData?.graduation_year?.toString() ?? '',
    linkedin_url:    initialData?.linkedin_url    ?? '',
    target_roles:    initialData?.target_roles?.join(', ')    ?? '',
    skills:          initialData?.skills?.join(', ')          ?? '',
  });

  const [targetSectors, setTargetSectors] = useState<string[]>(
    initialData?.target_sectors ?? []
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleSector = (sector: string) => {
    setTargetSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Your session expired. Please sign in again.');
      setLoading(false);
      return;
    }

    const payload = {
      user_id: user.id,
      full_name: form.full_name || null,
      university: form.university || null,
      degree: form.degree || null,
      graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
      linkedin_url: form.linkedin_url || null,
      target_roles: form.target_roles
        ? form.target_roles.split(',').map((r) => r.trim()).filter(Boolean)
        : null,
      skills: form.skills
        ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : null,
      target_sectors: targetSectors.length > 0 ? targetSectors : null,
    };

    const { error: upsertError } = await supabase
      .from('users_profile')
      .upsert(payload, { onConflict: 'user_id' });

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setSuccess(true);
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {error && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          Profile saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full name">
          <input value={form.full_name} onChange={(e) => set('full_name', e.target.value)}
            className={inputCls} placeholder="Alex Johnson" />
        </Field>
        <Field label="Email">
          <input value={userEmail} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
        </Field>
        <Field label="University">
          <input value={form.university} onChange={(e) => set('university', e.target.value)}
            className={inputCls} placeholder="University of Sussex" />
        </Field>
        <Field label="Degree">
          <input value={form.degree} onChange={(e) => set('degree', e.target.value)}
            className={inputCls} placeholder="BSc Computer Science" />
        </Field>
        <Field label="Graduation year">
          <select value={form.graduation_year} onChange={(e) => set('graduation_year', e.target.value)}
            className={inputCls}>
            <option value="">Select year…</option>
            {GRAD_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </Field>
        <Field label="LinkedIn URL">
          <input type="url" value={form.linkedin_url}
            onChange={(e) => set('linkedin_url', e.target.value)}
            className={inputCls} placeholder="https://linkedin.com/in/..." />
        </Field>
      </div>

      <Field label="Target roles (comma-separated)">
        <input value={form.target_roles} onChange={(e) => set('target_roles', e.target.value)}
          className={inputCls} placeholder="Software Engineer, Product Manager, Data Analyst" />
        <p className="text-xs text-muted-foreground mt-1">Separate each role with a comma.</p>
      </Field>

      <Field label="Skills (comma-separated)">
        <input value={form.skills} onChange={(e) => set('skills', e.target.value)}
          className={inputCls} placeholder="Python, React, SQL, Communication" />
      </Field>

      <div>
        <label className="text-sm font-medium text-foreground">Target sectors</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {SECTORS.map((sector) => (
            <button
              key={sector}
              type="button"
              onClick={() => toggleSector(sector)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                targetSectors.includes(sector)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-background text-muted-foreground border-border hover:border-blue-300'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
      >
        {loading ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-background border border-input text-foreground placeholder-muted-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors';
