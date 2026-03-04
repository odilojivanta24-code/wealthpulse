'use client'

interface TickerItem {
  label: string
  value: string
  change?: string
  positive?: boolean
}

const TICKER_DATA: TickerItem[] = [
  { label: 'IHSG', value: '7.241,55', change: '+0,63%', positive: true },
  { label: 'IDR/USD', value: '15.824', change: '-0,12%', positive: false },
  { label: 'EMAS ANTAM', value: 'Rp1.350.000/gr', change: '+0,30%', positive: true },
  { label: 'BTC DOM', value: '54,2%', change: '+1,2%', positive: true },
  { label: 'BTC/IDR', value: 'Rp1.050.000.000', change: '+2,1%', positive: true },
  { label: 'BBCA', value: '9.800', change: '+1,0%', positive: true },
  { label: 'TLKM', value: '3.420', change: '-0,3%', positive: false },
  { label: 'ETH/IDR', value: 'Rp55.600.000', change: '+3,1%', positive: true },
]

export default function TickerBar() {
  const items = [...TICKER_DATA, ...TICKER_DATA] // duplicate for seamless loop

  return (
    <div className="bg-[#0d1424] border-b border-white/6 h-9 overflow-hidden flex items-center">
      <div className="flex-shrink-0 px-3 border-r border-white/10 h-full flex items-center">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Live</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="ticker-track flex items-center gap-0">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-5 px-6 border-r border-white/5 whitespace-nowrap">
              <span className="text-[11px] text-slate-500 font-semibold">{item.label}</span>
              <span className="text-[11px] text-slate-200 font-mono">{item.value}</span>
              {item.change && (
                <span className={`text-[11px] font-semibold ${item.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.change}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
