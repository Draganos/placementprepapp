import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AiInsight } from '@/types/database';
import { formatRelative } from '@/lib/utils';
import { GenerateInsightButton } from '@/components/dashboard/GenerateInsightButton';
import { Sparkles, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

export default async function InsightsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: insights } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { count: appCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const allInsights = (insights as AiInsight[]) ?? [];
  const latest = allInsights[0];
  const canGenerate = (appCount ?? 0) >= 3;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Weekly strategy recommendations based on your application data.
          </p>
        </div>
        <GenerateInsightButton canGenerate={canGenerate} />
      </div>

      {!canGenerate && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-amber-800 text-sm font-medium">Add at least 3 applications</p>
          <p className="text-amber-700 text-sm mt-1">
            AI insights are generated from your real application data. Add more applications
            to unlock this feature.
          </p>
        </div>
      )}

      {/* Latest insight */}
      {latest && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-blue-50/50">
            <Sparkles size={16} className="text-blue-500" />
            <span className="text-sm font-semibold text-blue-700">Latest Insight</span>
            <span className="text-xs text-muted-foreground ml-auto">
              Generated {formatRelative(latest.created_at)}
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Summary */}
            <div>
              <p className="text-sm leading-relaxed text-foreground">{latest.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Strengths */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-green-500" />
                  <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide">What&apos;s working</h3>
                </div>
                <ul className="space-y-2">
                  {latest.strengths?.map((s, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide">What to improve</h3>
                </div>
                <ul className="space-y-2">
                  {latest.weaknesses?.map((w, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next steps */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ArrowRight size={14} className="text-blue-500" />
                  <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide">This week</h3>
                </div>
                <ul className="space-y-2">
                  {latest.next_steps?.map((n, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5 shrink-0">→</span>
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {allInsights.length > 1 && (
        <div className="bg-card border border-border rounded-xl">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Previous Insights</h2>
          </div>
          <div className="divide-y divide-border">
            {allInsights.slice(1).map((insight) => (
              <div key={insight.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(insight.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{insight.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {allInsights.length === 0 && canGenerate && (
        <div className="text-center py-16 text-muted-foreground">
          <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No insights generated yet.</p>
          <p className="text-xs mt-1">Click &quot;Generate Insights&quot; to get your first report.</p>
        </div>
      )}
    </div>
  );
}
