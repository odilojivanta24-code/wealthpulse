"use client"
import { Search, Bell } from "lucide-react"
import { useState, useEffect } from "react"

const tickers = [
  { label: "IHSG", value: "7,241.55", chg: "+0.63%", up: true },
  { label: "IDR/USD", value: "15,400", chg: "0.0%", up: null },
  { label: "EMAS", value: "Rp 1.135.000", chg: "+0.2%", up: true },
  { label: "BTC.D", value: "54.2%", chg: "+1.1%", up: true },
  { label: "BTC", value: "$64,230", chg: "+4.1%", up: true },
]

export function Topbar() {
  const [date, setDate] = useState("")

  useEffect(() => {
    const d = new Date()
    setDate(d.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }))
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-subtle">
      {/* Ticker */}
      <div className="overflow-hidden border-b border-subtle bg-bg2/50 py-1.5">
        <div className="flex gap-8 animate-marquee whitespace-nowrap px-6" style={{width:"max-content"}}>
          {[...tickers, ...tickers].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-muted">{t.label}</span>
              <span className="font-mono-custom text-foreground">{t.value}</span>
              <span className={t.up === true ? "text-success font-semibold" : t.up === false ? "text-danger font-semibold" : "text-subtle"}>
                {t.up === true ? "▲" : t.up === false ? "▼" : "—"} {t.chg}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main bar */}
      <div className="flex items-center justify-between px-7 py-3">
        <div className="flex items-center gap-3 bg-card border border-subtle rounded-sm px-4 py-2 w-72 focus-within:border-cyan/50 transition-colors">
          <Search size={14} className="text-subtle" />
          <input
            type="text"
            placeholder="Cari aset, simbol..."
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-subtle flex-1"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[13px] font-semibold text-foreground">{date}</div>
            <div className="text-[11px] text-success">● Market Aktif (EOD)</div>
          </div>
          <button className="relative w-9 h-9 rounded-full bg-card border border-subtle flex items-center justify-center hover:bg-card2 transition-colors">
            <Bell size={16} className="text-muted" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-bg" />
          </button>
        </div>
      </div>
    </header>
  )
}
