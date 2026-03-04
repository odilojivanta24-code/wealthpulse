import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatIDR, formatPercent, calculateWAC, calculateUnrealizedPnL, progressToTarget } from '@/lib/calculations'
import Link from 'next/link'

export const revalidate = 300

const TYPE_EMOJI: Record<string, string> = { STOCK: '📈', CRYPTO: '₿', GOLD: '🏅', BOND: '📋', CASH: '💵', ETF: '📦' }
const TYPE_LABEL: Record<string, string> = { STOCK: 'Saham IDX', CRYPTO: 'Kripto', GOLD: 'Emas', BOND: 'Obligasi/SBN', CASH: 'Kas', ETF: 'ETF' }

export default async function PortfolioPage() {
  const session = await auth()
  const userId = session!.user!.id as string

  const assets = await prisma.asset.findMany({
    where: { userId, isActive: true },
    include: {
      transactions: { orderBy: { date: 'asc' } },
      prices: { orderBy: { ts: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'asc' },
  })

  const positions = assets.map(asset => {
    const txs = asset.transactions.map(t => ({
      type: t.type,
      quantity: t.quantity ? Number(t.quantity) : null,
      price: t.price ? Number(t.price) : null,
      amount: t.amount ? Number(t.amount) : null,
      fee: t.fee ? Number(t.fee) : null,
      tax: t.tax ? Number(t.tax) : null,
    }))
    const wac = calculateWAC(txs)
    const lastPrice = asset.prices[0] ? Number(asset.prices[0].close) : 0
    const marketValue = wac.quantity * lastPrice
    const unrealized = calculateUnrealizedPnL(wac.quantity, wac.avgCost, lastPrice)
    const progress = asset.targetPrice && wac.avgCost ? progressToTarget(lastPrice, wac.avgCost, Number(asset.targetPrice)) : null

    return { ...asset, wac, lastPrice, marketValue, unrealized, progress }
  })

  const totalMV = positions.reduce((s, p) => s + p.marketValue, 0)
  const totalUnrealized = positions.reduce((s, p) => s + p.unrealized.amount, 0)
  const totalRealized = positions.reduce((s, p) => s + p.wac.realizedPnL, 0)

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Cabinet Grotesk' }}>My Assets</h1>
          <p className="text-slate-400 text-sm mt-0.5">Semua posisi investasi aktif Anda</p>
        </div>
        <Link href="/add-asset" className="btn-primary flex items-center gap-2 text-sm">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Tambah Aset
        </Link>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">Total Market Value</p>
          <p className="text-xl font-black gradient-text" style={{ fontFamily: 'Cabinet Grotesk' }}>{formatIDR(totalMV)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">Unrealized P/L</p>
          <p className={`text-xl font-black num-display ${totalUnrealized >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={{ fontFamily: 'Cabinet Grotesk' }}>
            {totalUnrealized >= 0 ? '+' : ''}{formatIDR(totalUnrealized)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">Realized P/L</p>
          <p className={`text-xl font-black num-display ${totalRealized >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={{ fontFamily: 'Cabinet Grotesk' }}>
            {totalRealized >= 0 ? '+' : ''}{formatIDR(totalRealized)}
          </p>
        </div>
      </div>

      {/* Asset cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {positions.map(pos => (
          <Link key={pos.id} href={`/portfolio/${pos.id}`}>
            <div className="card p-5 hover:border-white/18 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg type-${pos.type.toLowerCase()}`}>
                    {TYPE_EMOJI[pos.type]}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{pos.symbol}</p>
                    <p className="text-[11px] text-slate-500">{pos.name ?? TYPE_LABEL[pos.type]}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${
                  pos.type === 'STOCK' ? 'type-stock' :
                  pos.type === 'CRYPTO' ? 'type-crypto' :
                  pos.type === 'GOLD' ? 'type-gold' :
                  'type-bond'
                }`}>
                  {TYPE_LABEL[pos.type]}
                </span>
              </div>

              {/* Price */}
              <div className="mb-3">
                <p className="text-2xl font-black text-white num-display" style={{ fontFamily: 'Cabinet Grotesk' }}>
                  {formatIDR(pos.lastPrice)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-sm font-semibold ${pos.unrealized.percent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPercent(pos.unrealized.percent)}
                  </span>
                  <span className="text-xs text-slate-500">dari avg cost</span>
                </div>
              </div>

              {/* Holdings */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl bg-white/3">
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Kepemilikan</p>
                  <p className="text-sm font-semibold text-slate-200">
                    {pos.wac.quantity % 1 === 0 ? pos.wac.quantity.toLocaleString('id-ID') : pos.wac.quantity.toFixed(6)} {pos.type === 'GOLD' ? 'gram' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Nilai Pasar</p>
                  <p className="text-sm font-semibold text-slate-200">{formatIDR(pos.marketValue, true)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Avg Cost</p>
                  <p className="text-sm font-semibold text-slate-200">{formatIDR(pos.wac.avgCost)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Unrealized P/L</p>
                  <p className={`text-sm font-semibold ${pos.unrealized.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pos.unrealized.amount >= 0 ? '+' : ''}{formatIDR(pos.unrealized.amount, true)}
                  </p>
                </div>
              </div>

              {/* Progress to TP */}
              {pos.targetPrice && (
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[11px] text-slate-500">Target: {formatIDR(Number(pos.targetPrice))}</span>
                    <span className="text-[11px] text-cyan-400 font-semibold">{pos.progress?.toFixed(0)}% ke TP</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill-cyan" style={{ width: `${Math.min(100, pos.progress ?? 0)}%` }} />
                  </div>
                  {pos.stopLossPrice && (
                    <p className="text-[10px] text-slate-600 mt-1">SL: {formatIDR(Number(pos.stopLossPrice))}</p>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}

        {/* Add new card */}
        <Link href="/add-asset">
          <div className="card p-5 border-dashed border-white/12 hover:border-cyan-500/40 hover:bg-cyan-500/3 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[200px] gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-400">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-300 text-sm">Tambah Aset Baru</p>
              <p className="text-xs text-slate-600 mt-1">Saham, Kripto, Emas, atau ORI</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
