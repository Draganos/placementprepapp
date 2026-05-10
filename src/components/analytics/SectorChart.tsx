'use client';

import { SectorData } from '@/types/database';

interface SectorChartProps {
  data: SectorData[];
}

export function SectorChart({ data }: SectorChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No sector data yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 text-xs text-muted-foreground font-medium">Sector</th>
            <th className="text-right py-2 text-xs text-muted-foreground font-medium">Applied</th>
            <th className="text-right py-2 text-xs text-muted-foreground font-medium">Interviews</th>
            <th className="text-right py-2 text-xs text-muted-foreground font-medium">Offers</th>
            <th className="py-2 pl-4 text-xs text-muted-foreground font-medium">Volume</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row) => (
            <tr key={row.sector} className="hover:bg-muted/20 transition-colors">
              <td className="py-3 font-medium">{row.sector}</td>
              <td className="py-3 text-right text-muted-foreground">{row.count}</td>
              <td className="py-3 text-right">
                <span className={row.interviews > 0 ? 'text-purple-600 font-medium' : 'text-muted-foreground'}>
                  {row.interviews}
                </span>
              </td>
              <td className="py-3 text-right">
                <span className={row.offers > 0 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                  {row.offers}
                </span>
              </td>
              <td className="py-3 pl-4">
                <div className="h-2.5 bg-muted rounded-full overflow-hidden w-full min-w-24">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(row.count / max) * 100}%` }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
