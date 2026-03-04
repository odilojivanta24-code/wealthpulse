"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatIDR } from "@/lib/utils"
import { ChevronRight, ChevronLeft, Save } from "lucide-react"

const STEPS = ["Tipe Aset", "Info Dasar", "Strategi & Risiko", "Review"]
const ASSET_TYPES = [
  { key: "STOCK", label: "Saham IDX", icon: "📈", desc: "BBCA, TLKM, GOTO..." },
  { key: "CRYPTO", label: "Crypto", icon: "₿", desc: "BTC, ETH, BNB..." },
  { key: "GOLD", label: "Emas", icon: "🏅", desc: "Antam, UBS, Logam Mulia" },
  { key: "BOND", label: "Obligasi / ORI", icon: "📋", desc: "ORI024, SR021..." },
]

export function AddAssetClient() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    type: "", symbol: "", name: "", exchange: "IDX", currency: "IDR",
    quantity: "", avgCost: "", targetPrice: "", stopLossPrice: "",
    notes: "", couponRate: "", maturityDate: "", faceValue: "",
  })

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  const qty = parseFloat(form.quantity) || 0
  const avg = parseFloat(form.avgCost) || 0
  const tp = parseFloat(form.targetPrice) || 0
  const sl = parseFloat(form.stopLossPrice) || 0
  const totalInvest = qty * avg
  const potGain = tp > 0 ? (tp - avg) * qty : 0
  const potLoss = sl > 0 ? (avg - sl) * qty : 0
  const rr = potLoss > 0 ? (potGain / potLoss).toFixed(1) : "—"

  async function handleSave() {
    setSaving(true)
    try {
      // 1. Create asset
      const assetRes = await fetch("/api/assets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type, symbol: form.symbol, name: form.name,
          exchange: form.exchange, currency: form.currency,
          targetPrice: form.targetPrice || null,
          stopLossPrice: form.stopLossPrice || null,
          notes: form.notes,
          couponRate: form.couponRate || null,
          maturityDate: form.maturityDate || null,
          faceValue: form.faceValue || null,
        }),
      })
      const asset = await assetRes.json()

      // 2. Create initial BUY transaction
      if (form.quantity && form.avgCost) {
        await fetch("/api/transactions", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetId: asset.id, type: "BUY", date: new Date().toISOString(),
            quantity: form.quantity, price: form.avgCost, fee: "0",
          }),
        })
      }

      router.push("/portfolio")
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-semibold text-cyan uppercase tracking-wider mb-2">🎯 Entry Baru</div>
        <h1 className="font-display font-bold text-3xl text-foreground">Tambah Aset</h1>
        <p className="text-muted text-sm mt-1">Catat posisi baru untuk tracking portofolio kamu</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={"flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all " +
              (step === i ? "bg-gradient-to-r from-accent to-cyan text-white" :
               step > i ? "text-success" : "text-muted")}>
              <span className={"w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold " +
                (step > i ? "bg-success/20 text-success" : step === i ? "bg-white/20 text-white" : "bg-white/7 text-muted")}>
                {step > i ? "✓" : i + 1}
              </span>
              {s}
            </div>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-subtle/30 mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="col-span-2 space-y-5">

          {/* Step 0: Type */}
          {step === 0 && (
            <div className="bg-card border border-subtle rounded-lg p-6 animate-fade-in">
              <h2 className="font-semibold text-foreground mb-5">Pilih Tipe Aset</h2>
              <div className="grid grid-cols-2 gap-3">
                {ASSET_TYPES.map(t => (
                  <button key={t.key} onClick={() => set("type", t.key)}
                    className={"p-5 rounded-lg border-2 text-left transition-all " +
                      (form.type === t.key ? "border-cyan bg-cyan-dim" : "border-subtle bg-bg2 hover:border-white/20")}>
                    <div className="text-3xl mb-2">{t.icon}</div>
                    <div className="font-semibold text-foreground mb-0.5">{t.label}</div>
                    <div className="text-xs text-muted">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Basic info */}
          {step === 1 && (
            <div className="bg-card border border-subtle rounded-lg p-6 animate-fade-in">
              <h2 className="font-semibold text-foreground mb-5">Informasi Aset</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-subtle font-semibold uppercase tracking-wider block mb-2">Simbol / Kode</label>
                  <input value={form.symbol} onChange={e => set("symbol", e.target.value.toUpperCase())}
                    placeholder={form.type === "CRYPTO" ? "BTC, ETH..." : form.type === "GOLD" ? "EMAS, XAU..." : "BBCA, TLKM..."}
                    className="w-full bg-bg2 border border-subtle rounded-sm px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan/50 font-mono-custom" />
                </div>
                <div>
                  <label className="text-xs text-subtle font-semibold uppercase tracking-wider block mb-2">Nama Aset</label>
                  <input value={form.name} onChange={e => set("name", e.target.value)}
                    placeholder="Bank Central Asia..." className="w-full bg-bg2 border border-subtle rounded-sm px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan/50" />
                </div>
                <div>
                  <label className="text-xs text-subtle font-semibold uppercase tracking-wider block mb-2">Jumlah / Kuantitas</label>
                  <input type="number" value={form.quantity} onChange={e => set("quantity", e.target.value)}
                    placeholder="100" className="w-full bg-bg2 border border-subtle rounded-sm px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan/50" />
                </div>
                <div>
                  <label className="text-xs text-subtle font-semibold uppercase tracking-wider block mb-2">Harga Beli Rata-rata</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">Rp</span>
                    <input type="number" value={form.avgCost} onChange={e => set("avgCost", e.target.value)}
                      placeholder="9.100" className="w-full bg-bg2 border border-subtle rounded-sm pl-9 pr-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan/50 font-mono-custom" />
                  </div>
                </div>
                {form.type === "BOND" && <>
                  <div>
                    <label className="text-xs text-subtle font-semibold uppercase tracking-wider block mb-2">Kupon (%/tahun)</label>
                    <input type="number" step="0.01" value={form.couponRate} onChange={e => set("couponRate", e.target.value)}
                      placeholder="6.75" className="w-full bg-bg2 border border-subtle rounded-sm px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan/50" />
                  </div>
                  <div>
                    <label className="text-xs text-subtle font-semibold uppercase tracking-wider block mb-2">Tanggal Jatuh Tempo</label>
                    <input type="date" value={form.maturityDate} onChange={e => set("maturityDate", e.target.value)}
                      className="w-full bg-bg2 border border-subtle rounded-sm px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan/50" />
                  </div>
                </>}
              </div>
            </div>
          )}

          {/* Step 2: Strategy */}
          {step === 2 && (
            <div className="bg-card border border-subtle rounded-lg p-6 animate-fade-in">
              <h2 className="font-semibold text-foreground mb-1">Strategi & Risiko</h2>
              <p className="text-muted text-xs mb-5">Opsional, tapi sangat disarankan untuk monitoring otomatis.</p>
              {form.type !== "BOND" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-subtle font-semibold uppercase tracking-wider block mb-2">Target Harga (TP)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">Rp</span>
                      <input type="number" value={form.targetPrice} onChange={e => set("targetPrice", e.target.value)}
                        placeholder="11.000" className="w-full bg-bg2 border border-subtle rounded-sm pl-9 pr-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan/50 font-mono-custom" />
                    </div>
                    <div className="text-xs text-subtle mt-1">Level take profit</div>
                  </div>
                  <div>
                    <label className="text-xs text-subtle font-semibold uppercase tracking-wider block mb-2">Stop Loss (SL)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">Rp</span>
                      <input type="number" value={form.stopLossPrice} onChange={e => set("stopLossPrice", e.target.value)}
                        placeholder="7.800" className="w-full bg-bg2 border border-subtle rounded-sm pl-9 pr-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan/50 font-mono-custom" />
                    </div>
                    <div className="text-xs text-subtle mt-1">Level maksimum risiko</div>
                  </div>
                </div>
              ) : (
                <div className="bg-cyan-dim border border-cyan/20 rounded p-4 text-sm text-muted">
                  📋 Untuk Obligasi/ORI, monitoring berbasis kupon & jatuh tempo, bukan TP/SL.
                </div>
              )}
              <div className="mt-4">
                <label className="text-xs text-subtle font-semibold uppercase tracking-wider block mb-2">Catatan Strategi</label>
                <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3}
                  placeholder="Alasan beli, target fundamental, level DCA berikutnya..."
                  className="w-full bg-bg2 border border-subtle rounded-sm px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan/50 resize-none" />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="bg-card border border-subtle rounded-lg p-6 animate-fade-in">
              <h2 className="font-semibold text-foreground mb-5">Review & Simpan</h2>
              <div className="space-y-3">
                {[
                  ["Tipe", ASSET_TYPES.find(t => t.key === form.type)?.label ?? form.type],
                  ["Simbol", form.symbol],
                  ["Nama", form.name],
                  ["Jumlah", form.quantity],
                  ["Harga Beli", form.avgCost ? formatIDR(parseFloat(form.avgCost)) : "—"],
                  ["Total Investasi", formatIDR(totalInvest)],
                  ["Target TP", form.targetPrice ? formatIDR(tp) : "—"],
                  ["Stop Loss", form.stopLossPrice ? formatIDR(sl) : "—"],
                  ["Catatan", form.notes || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-subtle last:border-0">
                    <span className="text-sm text-muted">{k}</span>
                    <span className="text-sm font-semibold text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 border border-subtle text-muted px-4 py-2.5 rounded-sm text-sm font-medium hover:text-foreground disabled:opacity-30 transition-colors">
              <ChevronLeft size={14} /> Kembali
            </button>
            {step < STEPS.length - 1 ? (
              <button disabled={step === 0 && !form.type} onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 bg-gradient-to-r from-accent to-cyan text-white font-semibold text-sm px-5 py-2.5 rounded-sm hover:opacity-90 disabled:opacity-40 glow-blue">
                Lanjut <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-accent to-cyan text-white font-semibold text-sm px-5 py-2.5 rounded-sm hover:opacity-90 disabled:opacity-50 glow-blue">
                <Save size={14} /> {saving ? "Menyimpan..." : "Simpan Aset"}
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="sticky top-24">
          <div className="bg-card border border-subtle rounded-lg p-5">
            <div className="text-xs font-semibold text-subtle uppercase tracking-wider mb-4">Live Preview</div>
            <div className="text-center py-4 border-b border-subtle mb-4">
              <div className="text-xs text-subtle mb-1">Total Investasi</div>
              <div className="font-display font-bold text-2xl text-foreground">{formatIDR(totalInvest)}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-success/10 rounded p-3">
                <div className="text-xs font-bold text-success uppercase tracking-wider mb-1">Potensi Gain</div>
                <div className="font-display font-bold text-lg text-success">+{formatIDR(Math.max(0, potGain))}</div>
                <div className="text-xs text-subtle">@ Target TP</div>
              </div>
              <div className="bg-danger/10 rounded p-3">
                <div className="text-xs font-bold text-danger uppercase tracking-wider mb-1">Potensi Loss</div>
                <div className="font-display font-bold text-lg text-danger">-{formatIDR(Math.max(0, potLoss))}</div>
                <div className="text-xs text-subtle">@ Stop Loss</div>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted">Risk/Reward</span>
              <span className={"text-lg font-display font-bold " +
                (parseFloat(rr) >= 2 ? "text-success" : parseFloat(rr) >= 1 ? "text-warning" : "text-danger")}>
                1 : {rr}
              </span>
            </div>
            <div className="h-1.5 bg-white/7 rounded-full overflow-hidden mb-1">
              <div className="h-full rounded-full bg-gradient-to-r from-danger via-warning to-success transition-all"
                style={{ width: Math.min(100, (parseFloat(rr) || 0) / 3 * 100) + "%" }} />
            </div>
            <div className="text-right text-xs text-subtle">Target R/R &gt; 1:2</div>
            {form.type === "BOND" && parseFloat(form.couponRate) > 0 && parseFloat(form.quantity) > 0 && parseFloat(form.avgCost) > 0 && (
              <div className="mt-4 p-3 bg-cyan-dim rounded text-xs">
                <div className="font-semibold text-cyan mb-1">Kupon Perkiraan</div>
                <div className="text-foreground font-mono-custom">
                  {formatIDR(parseFloat(form.quantity) * parseFloat(form.avgCost) * (parseFloat(form.couponRate) / 100) / 12)}/bulan
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
