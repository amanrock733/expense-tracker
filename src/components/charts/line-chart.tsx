'use client'

import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

interface LineChartProps {
  data: Array<{ month: string; savings: number }>
}

export function LineChart({ data }: LineChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
        No savings data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
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
        <Area
          type="monotone"
          dataKey="savings"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#savingsGradient)"
          name="Savings"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
