
"use client"
import { useState } from "react"
import { formatIDR } from "@/lib/utils"
import { Plus, Download } from "lucide-react"

const TX_COLORS: Record<string, string> = {
  BUY: "bg-success/15 text-success",
  SELL: "bg-danger/15 text-danger",
  DIVIDEND: "bg-cyan-dim text-cyan",
  COUPON: "bg-cyan-dim text-cyan",
  FEE: "bg-warning/15 text-warning",
  TAX: "bg-warning/15 text-warning",
}

const MOCK_TX = [
  { id:"1", type:"BUY", date:"2025-06-12", asset:{symbol:"BBCA"}, quantity:1000, price:9100, fee:22750, notes:"Beli di support" },
  { id:"2", type:"SELL", date:"2025-06-08", asset:{symbol:"TLKM"}, quantity:500, price:3840, fee:9600, notes:"Take profit sebagian" },
  { id:"3", type:"COUPON", date:"2025-06-01", asset:{symbol:"ORI024"}, quantity:null, price:null, amount:2812500, notes:"Kupon bulan Juni" },
  { id:"4", type:"BUY", date:"2025-05-28", asset:{symbol:"BTC"}, quantity:0.05, price:62100, fee:0, notes:"DCA bulanan" },
  { id:"5", type:"BUY", date:"2025-05-15", asset:{symbol:"EMAS"}, quantity:10, price:1115000, fee:0, notes:"Emas Antam 10gr" },
  { id:"6", type:"DIVIDEND", date:"2025-04-30", asset:{symbol:"BBCA"}, quantity:null, price:null, amount:850000, notes:"Dividen FY2024" },
]

export function HistoryClient({ transactions }: { transactions: any[] }) {
  const [filter, setFilter] = useState("Semua")
  const display = transactions.length > 0 ? transactions : MOCK_TX
  const types = ["Semua", "BUY", "SELL", "DIVIDEND", "COUPON", "FEE"]

  const filtered = filter === "Semua" ? display : display.filter(t => t.type === filter)

  function exportCSV() {
    const rows = [["Tanggal","Tipe","Aset","Qty","Harga","Fee","Catatan"]]
    filtered.forEach(t => rows.push([
      new Date(t.date).toLocaleDateString("id-ID"),
      t.type, t.asset?.symbol ?? "-",
      t.quantity ?? "", t.price ?? t.amount ?? "", t.fee ?? "0", t.notes ?? ""
    ]))
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "history.csv"; a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">History Transaksi</h1>
          <p className="text-muted text-sm mt-0.5">Semua riwayat transaksi portofolio kamu</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV}
            className="flex items-center gap-2 bg-card border border-subtle rounded-sm px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-accent to-cyan text-white font-semibold text-sm px-4 py-2.5 rounded-sm hover:opacity-90 glow-blue">
            <Plus size={15} /> Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-card border border-subtle rounded-sm p-1 w-fit">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={"px-3 py-1.5 rounded text-xs font-semibold transition-all " +
              (filter === t ? "bg-gradient-to-r from-accent to-cyan text-white" : "text-muted hover:text-foreground")}>
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-subtle rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-subtle">
            <tr>
              {["Tanggal","Tipe","Aset","Qty","Harga / Amount","Fee","P/L Realized","Catatan"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-subtle uppercase tracking-wider px-5 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx, i) => {
              const qty = Number(tx.quantity ?? 0)
              const price = Number(tx.price ?? 0)
              const amount = Number(tx.amount ?? 0)
              const fee = Number(tx.fee ?? 0)
              return (
                <tr key={tx.id} className={"border-b border-subtle last:border-0 hover:bg-white/2 transition-colors " + (i % 2 === 0 ? "" : "bg-white/1")}>
                  <td className="px-5 py-3.5 text-sm text-muted">{new Date(tx.date).toLocaleDateString("id-ID")}</td>
                  <td className="px-5 py-3.5">
                    <span className={"px-2 py-0.5 rounded text-xs font-bold " + (TX_COLORS[tx.type] ?? "bg-white/7 text-muted")}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-foreground">{tx.asset?.symbol ?? "—"}</td>
                  <td className="px-5 py-3.5 text-sm font-mono-custom text-muted">{qty > 0 ? qty.toLocaleString("id-ID") : "—"}</td>
                  <td className="px-5 py-3.5 text-sm font-mono-custom text-foreground">
                    {price > 0 ? formatIDR(price) : amount > 0 ? formatIDR(amount) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono-custom text-warning">{fee > 0 ? formatIDR(fee) : "—"}</td>
                  <td className="px-5 py-3.5 text-sm">
                    {tx.type === "SELL" ? <span className="text-success font-semibold">Hitung →</span> : <span className="text-subtle">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-subtle max-w-[160px] truncate">{tx.notes ?? "—"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted text-sm">Belum ada transaksi.</div>
        )}
      </div>
    </div>
  )
}
