'use client'

import {
  PieChart as RPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

interface PieChartProps {
  data: Array<{ name: string; value: number }>
}

const COLORS = [
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#3b82f6', // blue
  '#a855f7', // purple
  '#14b8a6', // teal
]

export function PieChart({ data }: PieChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
        No expense data for this period
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RPieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={45}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => {
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
            return [`₹${value.toFixed(2)} (${pct}%)`, name]
          }}
          contentStyle={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value: string) => (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
        />
      </RPieChart>
    </ResponsiveContainer>
  )
}
