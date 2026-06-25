'use client'

import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface BarChartProps {
  data: Array<{ month: string; expense: number; income?: number }>
}

export function BarChart({ data }: BarChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
        No monthly data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
        />
        <Tooltip
          formatter={(value: number) => `₹${value.toFixed(2)}`}
          contentStyle={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
        {data[0]?.income !== undefined && (
          <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
        )}
      </RBarChart>
    </ResponsiveContainer>
  )
}
