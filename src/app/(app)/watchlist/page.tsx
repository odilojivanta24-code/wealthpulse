import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatIDR } from '@/lib/calculations'
import AddWatchlistButton from '@/components/watchlist/AddWatchlistButton'
import RemoveWatchlistButton from '@/components/watchlist/RemoveWatchlistButton'

const TYPE_EMOJI: Record<string, string> = { STOCK: '📈', CRYPTO: '₿', GOLD: '🏅', BOND: '📋', CASH: '💵', ETF: '📦' }

export default async function WatchlistPage() {
  const session = await auth()
  const userId = session!.user!.id as string

  const items = await prisma.watchlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Cabinet Grotesk' }}>Watchlist</h1>
          <p className="text-slate-400 text-sm mt-0.5">Aset yang dipantau tapi belum dibeli</p>
        </div>
        <AddWatchlistButton />
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">👁️</div>
          <p className="text-slate-300 font-semibold mb-1">Watchlist Kosong</p>
          <p className="text-slate-500 text-sm">Tambahkan aset yang ingin Anda pantau sebelum membelinya</p>
          <AddWatchlistButton className="mt-4 mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="card p-5 hover:border-white/18 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg type-${item.type.toLowerCase()}`}>
                    {TYPE_EMOJI[item.type]}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{item.symbol}</p>
                    <p className="text-[11px] text-slate-500">{item.name || item.exchange}</p>
                  </div>
                </div>
                <RemoveWatchlistButton id={item.id} />
              </div>

              {item.targetBuyPrice && (
                <div className="bg-white/3 rounded-xl p-3 mb-3">
                  <p className="text-[10px] text-slate-500 mb-0.5">Target Beli</p>
                  <p className="text-sm font-bold text-cyan-400">{formatIDR(Number(item.targetBuyPrice))}</p>
                </div>
              )}

              {item.notes && (
                <p className="text-xs text-slate-500 line-clamp-2">{item.notes}</p>
              )}

              <div className="mt-4 pt-3 border-t border-white/6">
                <a href="/add-asset" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                  + Beli sekarang →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
