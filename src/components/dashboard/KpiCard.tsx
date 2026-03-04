interface KpiCardProps {
  label: string
  value: string
  subValue?: string
  positive?: boolean
  highlight?: boolean
  tooltip?: string
}

export default function KpiCard({ label, value, subValue, positive, highlight, tooltip }: KpiCardProps) {
  const isPositive = positive === undefined ? null : positive

  return (
    <div className={`card p-4 relative group ${highlight ? 'border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent' : ''}`}>
      {highlight && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-600/5 pointer-events-none" />
      )}
      <p className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
        {label}
        {tooltip && (
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/8 text-slate-500 cursor-help text-[9px]" title={tooltip}>?</span>
        )}
      </p>
      <p className={`text-xl font-black num-display ${
        highlight ? 'gradient-text' :
        isPositive === null ? 'text-white' :
        isPositive ? 'text-emerald-400' : 'text-red-400'
      }`} style={{ fontFamily: 'Cabinet Grotesk' }}>
        {value}
      </p>
      {subValue && (
        <p className={`text-xs mt-1 font-medium ${
          isPositive === null ? 'text-slate-500' :
          isPositive ? 'text-emerald-500' : 'text-red-500'
        }`}>
          {subValue}
        </p>
      )}
    </div>
  )
}
