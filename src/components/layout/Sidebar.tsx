'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart2,
  FileText,
  Sparkles,
  Settings,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/applications', label: 'Applications', icon: ClipboardList },
  { href: '/analytics',    label: 'Analytics',    icon: BarChart2 },
  { href: '/cv-versions',  label: 'CV Versions',  icon: FileText },
  { href: '/ai-insights',  label: 'AI Insights',  icon: Sparkles },
];

interface SidebarProps {
  userEmail?: string;
  userName?: string;
}

export function Sidebar({ userEmail, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : userEmail?.[0]?.toUpperCase() ?? 'U';

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-[hsl(222,47%,11%)] border-r border-white/8 shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <Link href="/dashboard" className="text-lg font-bold text-white">
          Placement<span className="text-blue-400">Prep</span>
        </Link>
        <p className="text-xs text-white/30 mt-0.5">Placement Intelligence</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={16} className={active ? 'text-blue-400' : ''} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/8 px-3 py-3 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            pathname.startsWith('/settings')
              ? 'bg-blue-500/20 text-blue-300'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          )}
        >
          <Settings size={16} />
          Settings
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Log out
        </button>

        {/* User badge */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            {userName && (
              <p className="text-xs font-medium text-white/80 truncate">{userName}</p>
            )}
            <p className="text-xs text-white/40 truncate">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
