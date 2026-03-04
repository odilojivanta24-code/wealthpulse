'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ASSET_TYPES = [
  { value: 'STOCK', label: 'Saham IDX', exchange: 'IDX' },
  { value: 'CRYPTO', label: 'Kripto', exchange: 'CRYPTO' },
  { value: 'GOLD', label: 'Emas', exchange: 'PHYSICAL' },
  { value: 'BOND', label: 'Obligasi/SBN', exchange: 'KSEI' },
  { value: 'ETF', label: 'ETF', exchange: 'IDX' },
]

export default function AddWatchlistButton({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ symbol: '', name: '', type: 'STOCK', exchange: 'IDX', targetBuyPrice: '', notes: '' })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleAdd() {
    if (!form.symbol) return
    setLoading(true)
    await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={`btn-primary flex items-center gap-2 text-sm ${className}`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Tambah ke Watchlist
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-white mb-5" style={{ fontFamily: 'Cabinet Grotesk' }}>Tambah ke Watchlist</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Jenis Aset</label>
                <select className="input-dark w-full" value={form.type} onChange={e => {
                  const t = ASSET_TYPES.find(x => x.value === e.target.value)
                  update('type', e.target.value)
                  if (t) update('exchange', t.exchange)
                }}>
                  {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Simbol</label>
                <input className="input-dark w-full" placeholder="misal: TLKM" value={form.symbol}
                  onChange={e => update('symbol', e.target.value.toUpperCase())} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Nama (opsional)</label>
                <input className="input-dark w-full" placeholder="misal: Telkom Indonesia" value={form.name}
                  onChange={e => update('name', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Target Harga Beli (Rp)</label>
                <input type="number" className="input-dark w-full" placeholder="0" value={form.targetBuyPrice}
                  onChange={e => update('targetBuyPrice', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Catatan</label>
                <textarea className="input-dark w-full resize-none" rows={2}
                  placeholder="Alasan watchlist, level entry yang ditunggu..."
                  value={form.notes} onChange={e => update('notes', e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setOpen(false)} className="btn-ghost flex-1">Batal</button>
              <button onClick={handleAdd} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Menyimpan...' : 'Tambahkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
