'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { APPLICATION_STATUSES, ApplicationStatus } from '@/types/database';

export function AddEventForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [eventType, setEventType] = useState<ApplicationStatus>('Applied');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Insert event
    await supabase.from('application_events').insert({
      application_id: applicationId,
      user_id: user.id,
      event_type: eventType,
      event_date: eventDate,
      notes: notes || null,
    });

    // Update application status to latest
    await supabase
      .from('applications')
      .update({ status: eventType })
      .eq('id', applicationId);

    setNotes('');
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleAdd} className="space-y-3">
      <p className="text-sm font-medium text-foreground">Log a stage update</p>
      <div className="grid grid-cols-2 gap-3">
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value as ApplicationStatus)}
          className="text-sm bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/50"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          required
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="text-sm bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
      </div>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional notes (e.g. 'Invited to virtual OA')"
        className="w-full text-sm bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/50"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {loading ? 'Adding…' : 'Add Update'}
      </button>
    </form>
  );
}
