'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddTransactionButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [assetSymbol, setAssetSymbol] = useState('')
  const [form, setForm] = useState({
    type: 'BUY',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    price: '',
    amount: '',
    fee: '',
    tax: '',
    notes: '',
  })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const showQtyPrice = ['BUY', 'SELL'].includes(form.type)

  async function handleSave() {
    if (!assetSymbol) return
    setLoading(true)
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, assetSymbol }),
    })
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Tambah Transaksi
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-white mb-5" style={{ fontFamily: 'Cabinet Grotesk' }}>Tambah Transaksi</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Simbol Aset</label>
                <input className="input-dark w-full" placeholder="misal: BBCA" value={assetSymbol}
                  onChange={e => setAssetSymbol(e.target.value.toUpperCase())} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Tipe</label>
                  <select className="input-dark w-full" value={form.type} onChange={e => update('type', e.target.value)}>
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                    <option value="DIVIDEND">DIVIDEND</option>
                    <option value="COUPON">COUPON (ORI)</option>
                    <option value="FEE">FEE</option>
                    <option value="TAX">PAJAK</option>
                    <option value="TRANSFER_IN">TRANSFER IN</option>
                    <option value="TRANSFER_OUT">TRANSFER OUT</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Tanggal</label>
                  <input type="date" className="input-dark w-full" value={form.date}
                    onChange={e => update('date', e.target.value)} />
                </div>
              </div>

              {showQtyPrice ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Kuantitas</label>
                    <input type="number" className="input-dark w-full" placeholder="0" value={form.quantity}
                      onChange={e => update('quantity', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Harga (Rp)</label>
                    <input type="number" className="input-dark w-full" placeholder="0" value={form.price}
                      onChange={e => update('price', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Fee (Rp)</label>
                    <input type="number" className="input-dark w-full" placeholder="0" value={form.fee}
                      onChange={e => update('fee', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Pajak (Rp)</label>
                    <input type="number" className="input-dark w-full" placeholder="0" value={form.tax}
                      onChange={e => update('tax', e.target.value)} />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Jumlah (Rp)</label>
                  <input type="number" className="input-dark w-full" placeholder="0" value={form.amount}
                    onChange={e => update('amount', e.target.value)} />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Catatan</label>
                <input className="input-dark w-full" placeholder="Opsional..." value={form.notes}
                  onChange={e => update('notes', e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setOpen(false)} className="btn-ghost flex-1">Batal</button>
              <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
