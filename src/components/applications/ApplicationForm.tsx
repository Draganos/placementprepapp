'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Application,
  ApplicationStatus,
  APPLICATION_STATUSES,
  SECTORS,
  CvVersion,
} from '@/types/database';

interface ApplicationFormProps {
  initialData?: Partial<Application>;
  cvVersions: CvVersion[];
  mode: 'create' | 'edit';
  applicationId?: string;
}

export function ApplicationForm({
  initialData,
  cvVersions,
  mode,
  applicationId,
}: ApplicationFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    company_name:    initialData?.company_name    ?? '',
    role_title:      initialData?.role_title      ?? '',
    sector:          initialData?.sector          ?? '',
    location:        initialData?.location        ?? '',
    application_date:initialData?.application_date?? '',
    deadline:        initialData?.deadline        ?? '',
    status:          initialData?.status          ?? 'Saved' as ApplicationStatus,
    source:          initialData?.source          ?? '',
    cv_version_id:   initialData?.cv_version_id   ?? '',
    job_url:         initialData?.job_url         ?? '',
    salary_range:    initialData?.salary_range    ?? '',
    notes:           initialData?.notes           ?? '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const payload = {
      ...form,
      user_id: user.id,
      application_date: form.application_date || null,
      deadline: form.deadline || null,
      cv_version_id: form.cv_version_id || null,
      sector: form.sector || null,
      location: form.location || null,
      source: form.source || null,
      job_url: form.job_url || null,
      salary_range: form.salary_range || null,
      notes: form.notes || null,
    };

    if (mode === 'create') {
      const { data, error: insertError } = await supabase
        .from('applications')
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      // Log the initial event
      await supabase.from('application_events').insert({
        application_id: data.id,
        user_id: user.id,
        event_type: form.status,
        event_date: form.application_date || new Date().toISOString().split('T')[0],
      });

      router.push('/applications');
      router.refresh();
    } else {
      const { error: updateError } = await supabase
        .from('applications')
        .update(payload)
        .eq('id', applicationId!);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      router.push(`/applications/${applicationId}`);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Company + Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Company name *">
          <input
            required
            value={form.company_name}
            onChange={(e) => set('company_name', e.target.value)}
            className={inputCls}
            placeholder="Goldman Sachs"
          />
        </Field>
        <Field label="Role title *">
          <input
            required
            value={form.role_title}
            onChange={(e) => set('role_title', e.target.value)}
            className={inputCls}
            placeholder="Software Engineer Intern"
          />
        </Field>
      </div>

      {/* Sector + Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Sector">
          <select
            value={form.sector}
            onChange={(e) => set('sector', e.target.value)}
            className={inputCls}
          >
            <option value="">Select sector…</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Location">
          <input
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            className={inputCls}
            placeholder="London, UK"
          />
        </Field>
      </div>

      {/* Status + Source */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Status *">
          <select
            required
            value={form.status}
            onChange={(e) => set('status', e.target.value as ApplicationStatus)}
            className={inputCls}
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Source">
          <input
            value={form.source}
            onChange={(e) => set('source', e.target.value)}
            className={inputCls}
            placeholder="LinkedIn, Company Website, Glassdoor…"
          />
        </Field>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Application date">
          <input
            type="date"
            value={form.application_date}
            onChange={(e) => set('application_date', e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Deadline">
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => set('deadline', e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      {/* CV Version + Salary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="CV version used">
          <select
            value={form.cv_version_id}
            onChange={(e) => set('cv_version_id', e.target.value)}
            className={inputCls}
          >
            <option value="">None selected</option>
            {cvVersions.map((cv) => (
              <option key={cv.id} value={cv.id}>{cv.version_name}</option>
            ))}
          </select>
        </Field>
        <Field label="Salary / range">
          <input
            value={form.salary_range}
            onChange={(e) => set('salary_range', e.target.value)}
            className={inputCls}
            placeholder="£30,000 / £28k–£35k"
          />
        </Field>
      </div>

      {/* Job URL */}
      <Field label="Job posting URL">
        <input
          type="url"
          value={form.job_url}
          onChange={(e) => set('job_url', e.target.value)}
          className={inputCls}
          placeholder="https://…"
        />
      </Field>

      {/* Notes */}
      <Field label="Notes">
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          className={`${inputCls} h-24 resize-none`}
          placeholder="Any notes about this application…"
        />
      </Field>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading
            ? mode === 'create' ? 'Adding…' : 'Saving…'
            : mode === 'create' ? 'Add Application' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-background border border-input text-foreground placeholder-muted-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors';
