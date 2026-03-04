'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ASSET_TYPES = [
  { value: 'STOCK', label: 'Saham IDX', icon: '📈', desc: 'BBCA, TLKM, GOTO, dll', colorClass: 'type-stock' },
  { value: 'CRYPTO', label: 'Kripto', icon: '₿', desc: 'BTC, ETH, dll', colorClass: 'type-crypto' },
  { value: 'GOLD', label: 'Emas', icon: '🏅', desc: 'Antam, UBS, dll', colorClass: 'type-gold' },
  { value: 'BOND', label: 'Obligasi/SBN', icon: '📋', desc: 'ORI, SR, SBR, SUN', colorClass: 'type-bond' },
  { value: 'ETF', label: 'ETF/Reksa Dana', icon: '📦', desc: 'EIDO, XBCA, dll', colorClass: 'text-pink-400' },
  { value: 'CASH', label: 'Kas', icon: '💵', desc: 'Dana Tunai', colorClass: 'type-cash' },
]

export default function AddAssetPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    type: '',
    symbol: '',
    name: '',
    exchange: '',
    currency: 'IDR',
    targetPrice: '',
    stopLossPrice: '',
    notes: '',
    // First transaction
    txDate: new Date().toISOString().split('T')[0],
    txType: 'BUY',
    txQty: '',
    txPrice: '',
    txFee: '',
    txTax: '',
    txNotes: '',
  })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  // Live preview calculations
  const totalInvest = parseFloat(form.txQty || '0') * parseFloat(form.txPrice || '0')
  const potentialGain = form.targetPrice ? (parseFloat(form.targetPrice) - parseFloat(form.txPrice || '0')) * parseFloat(form.txQty || '0') : 0
  const potentialLoss = form.stopLossPrice ? (parseFloat(form.txPrice || '0') - parseFloat(form.stopLossPrice)) * parseFloat(form.txQty || '0') : 0
  const rrRatio = potentialLoss > 0 ? (potentialGain / potentialLoss).toFixed(2) : '—'

  async function handleSave() {
    if (!form.type || !form.symbol) return setError('Pilih jenis aset dan isi simbol.')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan')
      router.push('/portfolio')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
      setLoading(false)
    }
  }

  const formatIDR = (v: number) => v > 0
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
    : 'Rp0'

  return (
    <div className="p-6 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">🎯 Entri Baru</p>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Cabinet Grotesk' }}>Tambah Aset</h1>
          <p className="text-slate-400 text-sm mt-1">Catat posisi baru untuk dilacak di portofolio Anda</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s < step ? 'bg-emerald-500 text-white' :
                s === step ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' :
                'bg-white/8 text-slate-500'
              }`}>
                {s < step ? '✓' : s}
              </div>
              <span className={`text-xs ${s === step ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                {s === 1 ? 'Jenis Aset' : s === 2 ? 'Detail & Transaksi' : 'Strategi'}
              </span>
              {s < 3 && <div className="w-8 h-px bg-white/10 mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-5">

            {/* Step 1 */}
            {step === 1 && (
              <div className="card p-6">
                <h2 className="font-bold text-white mb-4" style={{ fontFamily: 'Cabinet Grotesk' }}>Pilih Jenis Aset</h2>
                <div className="grid grid-cols-3 gap-3">
                  {ASSET_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => {
                        update('type', t.value)
                        update('exchange', t.value === 'STOCK' ? 'IDX' : t.value === 'CRYPTO' ? 'CRYPTO' : t.value === 'BOND' ? 'KSEI' : 'PHYSICAL')
                        update('currency', 'IDR')
                      }}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        form.type === t.value
                          ? 'border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                          : 'border-white/8 bg-white/2 hover:border-white/15'
                      }`}
                    >
                      <div className="text-2xl mb-2">{t.icon}</div>
                      <div className={`text-sm font-bold ${form.type === t.value ? 'text-cyan-400' : 'text-slate-200'}`}>{t.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => form.type ? setStep(2) : setError('Pilih jenis aset dulu')}
                    className="btn-primary"
                  >
                    Lanjut →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="card p-6 space-y-4">
                <h2 className="font-bold text-white" style={{ fontFamily: 'Cabinet Grotesk' }}>Detail Aset & Transaksi Pertama</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Simbol / Kode</label>
                    <input className="input-dark w-full" placeholder="misal: BBCA, BTC, ORI026" value={form.symbol}
                      onChange={e => update('symbol', e.target.value.toUpperCase())} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Nama Aset (opsional)</label>
                    <input className="input-dark w-full" placeholder="misal: Bank Central Asia" value={form.name}
                      onChange={e => update('name', e.target.value)} />
                  </div>
                </div>

                <div className="border-t border-white/6 pt-4">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Transaksi Pertama</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1.5">Tanggal Beli</label>
                      <input type="date" className="input-dark w-full" value={form.txDate}
                        onChange={e => update('txDate', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1.5">Jenis Transaksi</label>
                      <select className="input-dark w-full" value={form.txType} onChange={e => update('txType', e.target.value)}>
                        <option value="BUY">BUY — Pembelian</option>
                        <option value="TRANSFER_IN">TRANSFER IN</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1.5">
                        {form.type === 'BOND' ? 'Nominal (Rp)' : form.type === 'GOLD' ? 'Kuantitas (gram)' : 'Kuantitas (lot/unit)'}
                      </label>
                      <input type="number" className="input-dark w-full" placeholder="0" value={form.txQty}
                        onChange={e => update('txQty', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1.5">Harga Beli (Rp)</label>
                      <input type="number" className="input-dark w-full" placeholder="0" value={form.txPrice}
                        onChange={e => update('txPrice', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1.5">Fee/Komisi (Rp)</label>
                      <input type="number" className="input-dark w-full" placeholder="0" value={form.txFee}
                        onChange={e => update('txFee', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1.5">Pajak (Rp)</label>
                      <input type="number" className="input-dark w-full" placeholder="0" value={form.txTax}
                        onChange={e => update('txTax', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="btn-ghost">← Kembali</button>
                  <button onClick={() => form.symbol ? setStep(3) : setError('Isi simbol aset')} className="btn-primary flex-1">
                    Lanjut: Strategi →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="card p-6 space-y-4">
                <h2 className="font-bold text-white" style={{ fontFamily: 'Cabinet Grotesk' }}>Strategi & Target (Opsional)</h2>
                <p className="text-xs text-slate-500">Atur target price dan stop loss untuk monitoring otomatis</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Target Price / Take Profit (Rp)</label>
                    <input type="number" className="input-dark w-full" placeholder="0" value={form.targetPrice}
                      onChange={e => update('targetPrice', e.target.value)} />
                    <p className="text-[11px] text-slate-600 mt-1">Harga tujuan untuk take profit</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1.5">Stop Loss Price (Rp)</label>
                    <input type="number" className="input-dark w-full" placeholder="0" value={form.stopLossPrice}
                      onChange={e => update('stopLossPrice', e.target.value)} />
                    <p className="text-[11px] text-slate-600 mt-1">Harga batas maksimal rugi</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Catatan Strategi</label>
                  <textarea
                    className="input-dark w-full resize-none"
                    rows={3}
                    placeholder="Alasan beli, thesis investasi, atau rencana exit..."
                    value={form.notes}
                    onChange={e => update('notes', e.target.value)}
                  />
                </div>

                {error && <p className="text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(2)} className="btn-ghost">← Kembali</button>
                  <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
                    {loading ? (
                      <span className="flex items-center gap-2 justify-center">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        Menyimpan...
                      </span>
                    ) : '💾 Simpan Aset'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="space-y-4">
            <div className="card p-5 sticky top-6">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-4">Live Preview</p>

              <div className="text-center pb-4 border-b border-white/6 mb-4">
                <p className="text-xs text-slate-500 mb-1">Total Investasi</p>
                <p className="text-2xl font-black text-white num-display" style={{ fontFamily: 'Cabinet Grotesk' }}>
                  {formatIDR(totalInvest)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-xl p-3">
                  <p className="text-[10px] text-emerald-400 font-semibold uppercase mb-1">Potensi Gain</p>
                  <p className="text-base font-black text-emerald-400 num-display">{formatIDR(potentialGain)}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">@ Target</p>
                </div>
                <div className="bg-red-500/8 border border-red-500/15 rounded-xl p-3">
                  <p className="text-[10px] text-red-400 font-semibold uppercase mb-1">Potensi Loss</p>
                  <p className="text-base font-black text-red-400 num-display">{formatIDR(potentialLoss)}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">@ Stop Loss</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-slate-400">Risk/Reward Ratio</span>
                  <span className="text-sm font-bold text-cyan-400">1 : {rrRatio}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill-cyan" style={{ width: `${Math.min(100, potentialGain > 0 && potentialLoss > 0 ? (potentialGain / (potentialGain + potentialLoss)) * 100 : 0)}%` }} />
                </div>
                <p className="text-[10px] text-slate-600 mt-1 text-right">R/R &gt; 1:2 disarankan</p>
              </div>

              <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-300 mb-1.5">💡 Tip</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {form.type === 'BOND'
                    ? 'Untuk ORI, harga beli = 1 (nominal face value Rp1). Masukkan nominal investasi di kuantitas.'
                    : form.type === 'GOLD'
                    ? 'Untuk emas Antam, masukkan jumlah gram di kuantitas dan harga per gram di harga beli.'
                    : 'Gunakan metode WAC (rata-rata tertimbang) untuk mencatat beberapa transaksi beli.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
