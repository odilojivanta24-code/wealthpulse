'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatIDR } from '@/lib/calculations'

const TYPE_COLORS: Record<string, string> = {
  STOCK: '#38bdf8',
  CRYPTO: '#f59e0b',
  GOLD: '#fbbf24',
  BOND: '#a78bfa',
  CASH: '#34d399',
  ETF: '#f472b6',
}

const TYPE_LABELS: Record<string, string> = {
  STOCK: 'Saham', CRYPTO: 'Kripto', GOLD: 'Emas',
  BOND: 'Obligasi', CASH: 'Kas', ETF: 'ETF',
}

interface Props {
  data: { type: string; value: number; percent: number }[]
  total: number
}

export default function AllocationDonut({ data, total }: Props) {
  if (data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Belum ada data.</div>
  }

  return (
    <div>
      <div className="h-40 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={72}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.type} fill={TYPE_COLORS[entry.type] || '#6b7280'} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#0d1424',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(v: number, _: string, props: { payload: { type: string } }) => [
                formatIDR(v),
                TYPE_LABELS[props.payload.type] || props.payload.type
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[10px] text-slate-500">Total</p>
          <p className="text-sm font-black text-white" style={{ fontFamily: 'Cabinet Grotesk' }}>
            {formatIDR(total, true)}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 space-y-2">
        {data.map((item) => (
          <div key={item.type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[item.type] || '#6b7280' }} />
              <span className="text-xs text-slate-400">{TYPE_LABELS[item.type] || item.type}</span>
            </div>
            <span className="text-xs font-semibold text-slate-200">{item.percent.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
