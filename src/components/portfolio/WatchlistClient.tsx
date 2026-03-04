
"use client"
import { useState } from "react"
import { Plus, Trash2, Eye, ArrowRight } from "lucide-react"

const MOCK_WATCHLIST = [
  { id:"1", symbol:"BBRI", name:"Bank Rakyat Indonesia", type:"STOCK", exchange:"IDX", notes:"Tunggu support kuat di 4.500" },
  { id:"2", symbol:"ETH", name:"Ethereum", type:"CRYPTO", exchange:"CRYPTO", notes:"Akumulasi jika koreksi ke $2.800" },
  { id:"3", symbol:"GOTO", name:"GoTo Gojek Tokopedia", type:"STOCK", exchange:"IDX", notes:"Monitor quarterly earnings" },
  { id:"4", symbol:"NVDA", name:"NVIDIA Corp", type:"STOCK", exchange:"NYSE", notes:"Setelah stock split settle" },
]

const TYPE_COLOR: Record<string, string> = {
  STOCK: "#22d07a", CRYPTO: "#f5b731", GOLD: "#f5832f", BOND: "#38d1f0"
}

export function WatchlistClient({ watchlist }: { watchlist: any[] }) {
  const [items, setItems] = useState(watchlist.length > 0 ? watchlist : MOCK_WATCHLIST)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ symbol: "", name: "", type: "STOCK", exchange: "IDX", notes: "" })

  async function addItem() {
    if (!form.symbol) return
    const res = await fetch("/api/watchlist", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
    })
    const item = await res.json()
    setItems([item, ...items])
    setShowAdd(false)
    setForm({ symbol: "", name: "", type: "STOCK", exchange: "IDX", notes: "" })
  }

  async function removeItem(id: string) {
    await fetch("/api/watchlist", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setItems(items.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Watchlist</h1>
          <p className="text-muted text-sm mt-0.5">Aset yang kamu pantau, belum dibeli</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-gradient-to-r from-accent to-cyan text-white font-semibold text-sm px-4 py-2.5 rounded-sm hover:opacity-90 glow-blue">
          <Plus size={15} /> Tambah ke Watchlist
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-card border border-cyan/30 rounded-lg p-5 animate-fade-in">
          <h3 className="font-semibold text-foreground mb-4">Tambah Aset ke Watchlist</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value.toUpperCase()})}
              placeholder="Simbol (BBRI, ETH...)" className="bg-bg2 border border-subtle rounded-sm px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan/50" />
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Nama aset" className="bg-bg2 border border-subtle rounded-sm px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan/50" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="bg-bg2 border border-subtle rounded-sm px-3 py-2.5 text-sm text-foreground outline-none">
              {["STOCK","CRYPTO","GOLD","BOND"].map(t => <option key={t}>{t}</option>)}
            </select>
            <input value={form.exchange} onChange={e => setForm({...form, exchange: e.target.value})}
              placeholder="Bursa (IDX, CRYPTO...)" className="bg-bg2 border border-subtle rounded-sm px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan/50" />
            <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="Catatan / alasan pantau" className="bg-bg2 border border-subtle rounded-sm px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan/50 col-span-2" />
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} className="bg-gradient-to-r from-accent to-cyan text-white text-sm font-semibold px-4 py-2 rounded-sm hover:opacity-90">Simpan</button>
            <button onClick={() => setShowAdd(false)} className="border border-subtle text-muted text-sm px-4 py-2 rounded-sm hover:text-foreground">Batal</button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-card border border-subtle rounded-lg p-5 hover:border-white/12 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm flex items-center justify-center text-xs font-bold"
                  style={{ background: (TYPE_COLOR[item.type] ?? "#8b8fb5") + "22", color: TYPE_COLOR[item.type] ?? "#8b8fb5" }}>
                  {item.symbol.slice(0,4)}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{item.symbol}</div>
                  <div className="text-xs text-subtle">{item.name} · {item.exchange}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-7 h-7 rounded flex items-center justify-center text-cyan hover:bg-cyan-dim transition-colors"><Eye size={13} /></button>
                <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded flex items-center justify-center text-danger hover:bg-danger/10 transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>

            {item.notes && (
              <div className="bg-bg2 rounded p-2.5 text-xs text-muted mb-3 italic">"{item.notes}"</div>
            )}

            <div className="flex items-center justify-between">
              <span className={"px-2 py-0.5 rounded text-xs font-bold " + (item.type === "STOCK" ? "bg-success/10 text-success" : item.type === "CRYPTO" ? "bg-warning/10 text-warning" : "bg-cyan-dim text-cyan")}>
                {item.type}
              </span>
              <button className="text-xs text-cyan hover:underline flex items-center gap-1">
                Beli Sekarang <ArrowRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 text-muted">
          <Eye size={40} className="mx-auto mb-3 opacity-30" />
          <div>Belum ada aset di watchlist.</div>
        </div>
      )}
    </div>
  )
}
