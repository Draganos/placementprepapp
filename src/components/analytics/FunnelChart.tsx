'use client';

import { FunnelData } from '@/types/database';

interface FunnelChartProps {
  data: FunnelData[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  const max = data[0]?.count || 1;

  return (
    <div className="space-y-3">
      {data.map((stage, i) => (
        <div key={stage.stage}>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-medium">{stage.stage}</span>
            <span className="text-muted-foreground">{stage.count} ({stage.rate}%)</span>
          </div>
          <div className="h-8 bg-muted rounded-lg overflow-hidden">
            <div
              className="h-full rounded-lg transition-all duration-500"
              style={{
                width: `${max > 0 ? (stage.count / max) * 100 : 0}%`,
                background: i === data.length - 1
                  ? 'hsl(142, 71%, 45%)'
                  : `hsl(221, 83%, ${65 - i * 8}%)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
