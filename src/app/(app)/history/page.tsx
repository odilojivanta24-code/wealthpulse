import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatIDR } from '@/lib/calculations'
import AddTransactionButton from '@/components/history/AddTransactionButton'

const TX_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  BUY: { label: 'BUY', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  SELL: { label: 'SELL', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  DIVIDEND: { label: 'DIVIDEN', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  COUPON: { label: 'KUPON', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  FEE: { label: 'FEE', color: 'text-slate-400', bg: 'bg-white/5 border-white/10' },
  TAX: { label: 'PAJAK', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  TRANSFER_IN: { label: 'MASUK', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  TRANSFER_OUT: { label: 'KELUAR', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
}

export default async function HistoryPage() {
  const session = await auth()
  const userId = session!.user!.id as string

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: { asset: true },
    orderBy: { date: 'desc' },
    take: 100,
  })

  // Group by month
  const grouped: Record<string, typeof transactions> = {}
  for (const tx of transactions) {
    const key = tx.date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(tx)
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Cabinet Grotesk' }}>History Transaksi</h1>
          <p className="text-slate-400 text-sm mt-0.5">{transactions.length} transaksi tercatat</p>
        </div>
        <AddTransactionButton />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-slate-300 font-semibold mb-1">Belum Ada Transaksi</p>
          <p className="text-slate-500 text-sm">Tambahkan aset pertama Anda untuk memulai</p>
          <a href="/add-asset" className="btn-primary inline-flex mt-4 text-sm gap-2 items-center">
            + Tambah Aset Pertama
          </a>
        </div>
      ) : (
        Object.entries(grouped).map(([month, txs]) => (
          <div key={month}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{month}</h3>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/6">
                    {['Tanggal', 'Tipe', 'Aset', 'Kuantitas', 'Harga', 'Nilai', 'Fee', 'Catatan'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {txs.map(tx => {
                    const cfg = TX_CONFIG[tx.type] || TX_CONFIG.BUY
                    const totalValue = tx.quantity && tx.price
                      ? Number(tx.quantity) * Number(tx.price)
                      : tx.amount ? Number(tx.amount) : 0

                    return (
                      <tr key={tx.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-400">
                          {tx.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-white">{tx.asset?.symbol ?? '—'}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[100px]">{tx.asset?.name}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-slate-300">
                          {tx.quantity ? Number(tx.quantity).toLocaleString('id-ID', { maximumFractionDigits: 8 }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-slate-300">
                          {tx.price ? formatIDR(Number(tx.price)) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono font-semibold text-white">
                          {totalValue > 0 ? formatIDR(totalValue) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-slate-500">
                          {tx.fee ? formatIDR(Number(tx.fee)) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] truncate" title={tx.notes ?? ''}>
                          {tx.notes || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
