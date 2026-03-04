
"use client"
import { useState } from "react"
import { formatIDR, formatPercent, calcUnrealizedPL, getAssetTypeLabel, getAssetTypeColor } from "@/lib/utils"
import { Plus, Search, Filter } from "lucide-react"
import Link from "next/link"

const TABS = ["Semua", "Saham", "Crypto", "Emas", "Obligasi"]
const TYPE_MAP: Record<string, string> = {
  "Saham": "STOCK", "Crypto": "CRYPTO", "Emas": "GOLD", "Obligasi": "BOND"
}

const MOCK_ASSETS = [
  { id:"1", symbol:"BBCA", name:"Bank Central Asia", type:"STOCK", quantity:1000, avgCost:8500, lastPrice:9250, targetPrice:11000, stopLossPrice:7800, currency:"IDR" },
  { id:"2", symbol:"BTC", name:"Bitcoin", type:"CRYPTO", quantity:0.15, avgCost:420000000, lastPrice:1010000000, targetPrice:1400000000, stopLossPrice:350000000, currency:"IDR" },
  { id:"3", symbol:"EMAS", name:"Emas Antam", type:"GOLD", quantity:50, avgCost:980000, lastPrice:1135000, targetPrice:1300000, stopLossPrice:900000, currency:"IDR" },
  { id:"4", symbol:"ORI024", name:"ORI024 6.75%", type:"BOND", quantity:25, avgCost:1000000, lastPrice:1000000, targetPrice:0, stopLossPrice:0, currency:"IDR", couponRate:6.75 },
  { id:"5", symbol:"TLKM", name:"Telkom Indonesia", type:"STOCK", quantity:2000, avgCost:3750, lastPrice:3680, targetPrice:4200, stopLossPrice:3400, currency:"IDR" },
]

export function PortfolioClient({ assets }: { assets: any[] }) {
  const [tab, setTab] = useState("Semua")
  const [search, setSearch] = useState("")

  const displayAssets = assets.length > 0 ? assets : MOCK_ASSETS

  const filtered = displayAssets.filter(a => {
    const matchTab = tab === "Semua" || a.type === TYPE_MAP[tab]
    const matchSearch = a.symbol.toLowerCase().includes(search.toLowerCase()) ||
      (a.name ?? "").toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const totalValue = displayAssets.reduce((s, a) => {
    const last = Number(a.prices?.[0]?.close ?? a.lastPrice ?? a.avgCost ?? 0)
    return s + last * Number(a.quantity ?? 0)
  }, 0)

  const totalPL = displayAssets.reduce((s, a) => {
    const last = Number(a.prices?.[0]?.close ?? a.lastPrice ?? a.avgCost ?? 0)
    const { amount } = calcUnrealizedPL(Number(a.quantity ?? 0), Number(a.avgCost ?? 0), last)
    return s + amount
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">My Assets</h1>
          <p className="text-muted text-sm mt-0.5">Kelola semua posisi investasi kamu</p>
        </div>
        <Link href="/portfolio/add"
          className="flex items-center gap-2 bg-gradient-to-r from-accent to-cyan text-white font-semibold text-sm px-4 py-2.5 rounded-sm hover:opacity-90 transition-opacity glow-blue">
          <Plus size={15} />
          Tambah Aset
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-subtle rounded-lg p-5">
          <div className="text-xs text-subtle font-semibold uppercase tracking-wider mb-2">Total Nilai</div>
          <div className="font-display font-bold text-2xl text-foreground">{formatIDR(totalValue)}</div>
        </div>
        <div className="bg-card border border-subtle rounded-lg p-5">
          <div className="text-xs text-subtle font-semibold uppercase tracking-wider mb-2">Unrealized P/L</div>
          <div className={"font-display font-bold text-2xl " + (totalPL >= 0 ? "text-success" : "text-danger")}>
            {totalPL >= 0 ? "+" : ""}{formatIDR(totalPL)}
          </div>
          <div className={"text-xs mt-1 " + (totalPL >= 0 ? "text-success" : "text-danger")}>
            {formatPercent(totalValue > 0 ? (totalPL / (totalValue - totalPL)) * 100 : 0)}
          </div>
        </div>
        <div className="bg-card border border-subtle rounded-lg p-5">
          <div className="text-xs text-subtle font-semibold uppercase tracking-wider mb-2">Jumlah Aset</div>
          <div className="font-display font-bold text-2xl text-foreground">{displayAssets.length}</div>
          <div className="text-xs text-muted mt-1">{new Set(displayAssets.map(a => a.type)).size} kategori</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1 bg-card border border-subtle rounded-sm p-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={"px-4 py-2 rounded text-sm font-medium transition-all " +
                (tab === t ? "bg-gradient-to-r from-accent to-cyan text-white" : "text-muted hover:text-foreground")}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-card border border-subtle rounded-sm px-3 py-2 w-64">
          <Search size={14} className="text-subtle" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari aset..." className="bg-transparent outline-none text-sm text-foreground placeholder:text-subtle flex-1" />
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map(a => <AssetCard key={a.id} asset={a} />)}
        <Link href="/portfolio/add"
          className="border border-dashed border-subtle rounded-lg flex flex-col items-center justify-center min-h-[220px] cursor-pointer hover:border-cyan/50 hover:bg-cyan-dim transition-all group">
          <div className="w-12 h-12 rounded-full bg-cyan-dim flex items-center justify-center text-cyan text-2xl mb-3 group-hover:scale-110 transition-transform">+</div>
          <div className="font-semibold text-foreground text-sm mb-1">Tambah Aset Baru</div>
          <div className="text-xs text-subtle text-center max-w-[140px]">Saham IDX, Crypto, Emas, atau Obligasi</div>
        </Link>
      </div>
    </div>
  )
}

function AssetCard({ asset }: { asset: any }) {
  const last = Number(asset.prices?.[0]?.close ?? asset.lastPrice ?? asset.avgCost ?? 0)
  const avg = Number(asset.avgCost ?? 0)
  const qty = Number(asset.quantity ?? 0)
  const { amount, percent } = calcUnrealizedPL(qty, avg, last)
  const tp = Number(asset.targetPrice ?? 0)
  const tpProgress = tp > 0 && avg > 0 ? Math.min(100, ((last - avg) / (tp - avg)) * 100) : 0
  const isBond = asset.type === "BOND"
  const color = getAssetTypeColor(asset.type)
  const isPos = amount >= 0

  return (
    <div className="bg-card border border-subtle rounded-lg p-5 hover:border-white/12 transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-sm flex items-center justify-center text-xs font-bold"
            style={{ background: color + "22", color }}>
            {asset.symbol.slice(0, 4)}
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">{asset.symbol}</div>
            <div className="text-xs text-subtle">{asset.name ?? getAssetTypeLabel(asset.type)}</div>
          </div>
        </div>
        <div className={"text-xs font-bold px-2 py-0.5 rounded " + (isPos ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>
          {isPos ? "▲" : "▼"} {Math.abs(percent).toFixed(1)}%
        </div>
      </div>

      <div className="font-display font-bold text-xl text-foreground mb-1">{formatIDR(last)}</div>
      <div className={"text-sm font-semibold " + (isPos ? "text-success" : "text-danger")}>
        {isPos ? "+" : ""}{formatIDR(amount)}
      </div>

      <div className="flex justify-between mt-4 pt-3 border-t border-subtle text-xs">
        <div>
          <div className="text-subtle mb-0.5">Holdings</div>
          <div className="text-foreground font-semibold">{qty.toLocaleString("id-ID")} {asset.type === "GOLD" ? "gr" : asset.type === "CRYPTO" ? "" : "lot"}</div>
        </div>
        <div className="text-right">
          <div className="text-subtle mb-0.5">Nilai</div>
          <div className="text-foreground font-semibold">{formatIDR(last * qty)}</div>
        </div>
      </div>

      {isBond ? (
        <div className="mt-3 p-2.5 bg-cyan-dim rounded-sm text-xs">
          <div className="flex justify-between">
            <span className="text-subtle">Kupon</span>
            <span className="text-cyan font-semibold">{asset.couponRate ?? "6.75"}%/thn</span>
          </div>
          {asset.maturityDate && (
            <div className="flex justify-between mt-1">
              <span className="text-subtle">Jatuh Tempo</span>
              <span className="text-foreground font-semibold">{new Date(asset.maturityDate).toLocaleDateString("id-ID")}</span>
            </div>
          )}
        </div>
      ) : tp > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-subtle">Target TP</span>
            <span className="text-cyan font-semibold">{formatIDR(tp)}</span>
          </div>
          <div className="h-1.5 bg-white/7 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: Math.max(0, tpProgress) + "%", background: `linear-gradient(90deg, ${color}, #38d1f0)` }} />
          </div>
          <div className="text-right text-xs text-subtle mt-1">{Math.max(0, tpProgress).toFixed(0)}% ke TP</div>
        </div>
      )}
    </div>
  )
}
