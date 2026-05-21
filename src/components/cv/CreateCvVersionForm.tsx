'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function CreateCvVersionForm() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName]   = useState('');
  const [notes, setNotes] = useState('');
  const [url, setUrl]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Your session expired. Please sign in again.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('cv_versions').insert({
      user_id: user.id,
      version_name: name,
      notes: notes || null,
      file_url: url || null,
      is_active: true,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setName('');
      setNotes('');
      setUrl('');
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleCreate} className="space-y-3">
      {error && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Version name (e.g. 'Tech CV v2')"
          className={inputCls}
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className={inputCls}
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="PDF link (optional)"
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        {loading ? 'Adding…' : 'Add CV Version'}
      </button>
    </form>
  );
}

const inputCls =
  'w-full bg-background border border-input text-foreground placeholder-muted-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors';
