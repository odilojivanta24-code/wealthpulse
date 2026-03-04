'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { date: string; value: number }[]
}

function formatIDRCompact(v: number) {
  if (v >= 1_000_000_000) return `Rp${(v / 1_000_000_000).toFixed(1)}M`
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(0)}jt`
  return `Rp${(v / 1_000).toFixed(0)}rb`
}

export default function NetWorthChartClient({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        Data historis belum tersedia. Tambahkan harga EOD untuk melihat grafik.
      </div>
    )
  }

  const minVal = Math.min(...data.map(d => d.value)) * 0.97
  const maxVal = Math.max(...data.map(d => d.value)) * 1.02

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minVal, maxVal]}
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatIDRCompact}
            width={70}
          />
          <Tooltip
            contentStyle={{
              background: '#0d1424',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#e2e8f0',
            }}
            formatter={(v: number) => [
              new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v),
              'Net Worth'
            ]}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00d4ff"
            strokeWidth={2}
            fill="url(#netWorthGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#00d4ff', stroke: '#080d1a', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
