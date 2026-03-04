import { formatIDR, formatPercent, progressToTarget } from '@/lib/calculations'

interface StrategicAsset {
  id: string
  symbol: string
  name: string | null
  type: string
  lastPrice: number
  avgCost: number
  quantity: number
  marketValue: number
  unrealizedAmount: number
  unrealizedPercent: number
  targetPrice: number | null
  stopLossPrice: number | null
  alertStatus: string
}

const STATUS_CONFIG = {
  TAKE_PROFIT: { label: 'Take Profit!', class: 'badge-profit' },
  STOP_LOSS: { label: 'Stop Loss!', class: 'badge-loss' },
  TP_SOON: { label: 'TP Segera', class: 'badge-warning' },
  SL_WARNING: { label: 'Waspada SL', class: 'badge-warning' },
  OK: { label: 'Hold', class: 'badge-neutral' },
}

const TYPE_EMOJI: Record<string, string> = {
  STOCK: '📈', CRYPTO: '₿', GOLD: '🏅', BOND: '📋', CASH: '💵', ETF: '📦'
}

export default function StrategicMonitor({ assets }: { assets: StrategicAsset[] }) {
  if (assets.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 text-sm">
        Belum ada aset dengan target harga. <a href="/add-asset" className="text-cyan-400 hover:underline">Tambah target →</a>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/6">
            {['Aset', 'Harga Terakhir', 'Avg Cost', 'Target / SL', 'Progress ke TP', 'P/L', 'Status'].map(h => (
              <th key={h} className="text-left pb-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider pr-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/4">
          {assets.map((asset) => {
            const progress = asset.targetPrice && asset.avgCost
              ? progressToTarget(asset.lastPrice, asset.avgCost, asset.targetPrice)
              : 0
            const status = STATUS_CONFIG[asset.alertStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.OK

            return (
              <tr key={asset.id} className="group hover:bg-white/2 transition-colors">
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm type-${asset.type.toLowerCase()}`}>
                      {TYPE_EMOJI[asset.type] ?? '📊'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{asset.symbol}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[120px]">{asset.name}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 pr-4">
                  <p className="text-sm font-mono text-white">{formatIDR(asset.lastPrice)}</p>
                </td>
                <td className="py-3.5 pr-4">
                  <p className="text-sm font-mono text-slate-300">{formatIDR(asset.avgCost)}</p>
                </td>
                <td className="py-3.5 pr-4">
                  <div className="space-y-0.5">
                    {asset.targetPrice && (
                      <p className="text-[11px] text-emerald-400">TP: {formatIDR(asset.targetPrice)}</p>
                    )}
                    {asset.stopLossPrice && (
                      <p className="text-[11px] text-red-400">SL: {formatIDR(asset.stopLossPrice)}</p>
                    )}
                  </div>
                </td>
                <td className="py-3.5 pr-6 w-32">
                  {asset.targetPrice ? (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] text-slate-500">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            progress >= 100 ? 'bg-emerald-400' :
                            progress >= 80 ? 'bg-amber-400' :
                            'bg-gradient-to-r from-cyan-500 to-blue-400'
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>
                  ) : <span className="text-slate-600 text-xs">—</span>}
                </td>
                <td className="py-3.5 pr-4">
                  <p className={`text-sm font-semibold ${asset.unrealizedAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {asset.unrealizedAmount >= 0 ? '+' : ''}{formatIDR(asset.unrealizedAmount)}
                  </p>
                  <p className={`text-[11px] ${asset.unrealizedPercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formatPercent(asset.unrealizedPercent)}
                  </p>
                </td>
                <td className="py-3.5">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${status.class}`}>
                    {status.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
