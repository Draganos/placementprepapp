'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Filter, ExternalLink, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  Application,
  ApplicationStatus,
  APPLICATION_STATUSES,
  SECTORS,
  CvVersion,
} from '@/types/database';
import { StatusBadge } from './StatusBadge';
import { formatDate, daysUntilDeadline } from '@/lib/utils';

type SortKey = 'company_name' | 'role_title' | 'application_date' | 'deadline' | 'status';

interface ApplicationsTableProps {
  applications: Application[];
  cvVersions: CvVersion[];
}

export function ApplicationsTable({ applications, cvVersions }: ApplicationsTableProps) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('application_date');
  const [sortAsc, setSortAsc] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = applications
    .filter((a) => {
      const q = search.toLowerCase();
      if (q && !a.company_name.toLowerCase().includes(q) && !a.role_title.toLowerCase().includes(q)) return false;
      if (statusFilter && a.status !== statusFilter) return false;
      if (sectorFilter && a.sector !== sectorFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const va = (a[sortKey] ?? '') as string;
      const vb = (b[sortKey] ?? '') as string;
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application? This cannot be undone.')) return;
    setDeleting(id);
    await supabase.from('applications').delete().eq('id', id);
    router.refresh();
    setDeleting(null);
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : <ChevronDown size={12} className="opacity-20" />;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border bg-muted/20">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or role…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | '')}
          className="text-sm bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/50"
        >
          <option value="">All statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="text-sm bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/50"
        >
          <option value="">All sectors</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {(search || statusFilter || sectorFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); setSectorFilter(''); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear filters
          </button>
        )}

        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">
          {applications.length === 0
            ? 'No applications yet. Add your first one!'
            : 'No applications match your filters.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <Th onClick={() => toggleSort('company_name')}>
                  Company <SortIcon col="company_name" />
                </Th>
                <Th onClick={() => toggleSort('role_title')}>
                  Role <SortIcon col="role_title" />
                </Th>
                <Th>Sector</Th>
                <Th onClick={() => toggleSort('status')}>
                  Status <SortIcon col="status" />
                </Th>
                <Th onClick={() => toggleSort('application_date')}>
                  Applied <SortIcon col="application_date" />
                </Th>
                <Th onClick={() => toggleSort('deadline')}>
                  Deadline <SortIcon col="deadline" />
                </Th>
                <Th>CV</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((app) => {
                const days = daysUntilDeadline(app.deadline);
                const deadlineUrgent = days !== null && days >= 0 && days <= 7;
                const cv = cvVersions.find((c) => c.id === app.cv_version_id);
                return (
                  <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold shrink-0">
                          {app.company_name[0]}
                        </div>
                        <div>
                          <Link
                            href={`/applications/${app.id}`}
                            className="font-medium hover:text-blue-500 transition-colors"
                          >
                            {app.company_name}
                          </Link>
                          {app.location && (
                            <p className="text-xs text-muted-foreground">{app.location}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">
                      {app.role_title}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {app.sector ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(app.application_date)}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {app.deadline ? (
                        <span className={deadlineUrgent ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
                          {formatDate(app.deadline)}
                          {days !== null && days >= 0 && days <= 14 && ` (${days}d)`}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {cv?.version_name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {app.job_url && (
                          <a
                            href={app.job_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
                            title="Open job posting"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <Link
                          href={`/applications/${app.id}/edit`}
                          className="p-1.5 text-muted-foreground hover:text-blue-500 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(app.id)}
                          disabled={deleting === app.id}
                          className="p-1.5 text-muted-foreground hover:text-red-500 rounded transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  onClick,
  align,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  align?: 'right';
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left ${align === 'right' ? 'text-right' : ''} ${onClick ? 'cursor-pointer hover:text-foreground select-none' : ''}`}
      onClick={onClick}
    >
      <span className="flex items-center gap-1">{children}</span>
    </th>
  );
}
