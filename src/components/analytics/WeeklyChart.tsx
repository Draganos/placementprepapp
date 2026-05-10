'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { WeeklyData } from '@/types/database';

interface WeeklyChartProps {
  data: WeeklyData[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No dated applications yet. Add application dates to see your activity over time.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(0 0% 100%)',
            border: '1px solid hsl(214 32% 91%)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ fontWeight: 600 }}
          cursor={{ fill: 'hsl(210 40% 96%)' }}
        />
        <Bar
          dataKey="applications"
          fill="hsl(221, 83%, 53%)"
          radius={[4, 4, 0, 0]}
          name="Applications"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
