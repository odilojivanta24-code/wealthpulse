
"use client"
import { formatIDR, formatPercent, calcUnrealizedPL, getAssetTypeLabel, getAssetTypeColor } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown, Bell, Target, AlertTriangle } from "lucide-react"

interface Props {
  assets: any[]
  recentTransactions: any[]
  activeAlerts: any[]
  userName: string
  userImage: string | null
}

const MOCK_CHART = [
  { d: "1 Jan", v: 420000000 }, { d: "1 Feb", v: 435000000 },
  { d: "1 Mar", v: 428000000 }, { d: "1 Apr", v: 450000000 },
  { d: "1 Mei", v: 447000000 }, { d: "1 Jun", v: 465000000 },
  { d: "1 Jul", v: 480000000 }, { d: "1 Agu", v: 510000000 },
  { d: "1 Sep", v: 505000000 }, { d: "1 Okt", v: 528000000 },
  { d: "1 Nov", v: 545000000 }, { d: "1 Des", v: 562590000 },
]

export function DashboardClient({ assets, recentTransactions, activeAlerts, userName, userImage }: Props) {
  // Calculate totals from assets
  const totalMarketValue = assets.reduce((sum, a) => {
    const lastPrice = Number(a.prices?.[0]?.close ?? a.avgCost ?? 0)
    const qty = Number(a.quantity ?? 0)
    return sum + lastPrice * qty
  }, 0)

  const totalUnrealized = assets.reduce((sum, a) => {
    const lastPrice = Number(a.prices?.[0]?.close ?? a.avgCost ?? 0)
    const qty = Number(a.quantity ?? 0)
    const avg = Number(a.avgCost ?? 0)
    const { amount } = calcUnrealizedPL(qty, avg, lastPrice)
    return sum + amount
  }, 0)

  // Allocation by type
  const allocationData = Object.entries(
    assets.reduce((acc: Record<string, number>, a) => {
      const val = Number(a.quantity ?? 0) * Number(a.prices?.[0]?.close ?? a.avgCost ?? 0)
      acc[a.type] = (acc[a.type] || 0) + val
      return acc
    }, {})
  ).map(([type, value]) => ({ type, value, label: getAssetTypeLabel(type), color: getAssetTypeColor(type) }))

  const isPositive = totalUnrealized >= 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Halo, {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-muted text-sm mt-0.5">Ini ringkasan portofolio kamu hari ini</p>
        </div>
        <div className="flex items-center gap-2">
          {activeAlerts.length > 0 && (
            <div className="flex items-center gap-2 bg-warning/10 border border-warning/30 rounded-sm px-3 py-2 text-sm text-warning font-medium">
              <Bell size={14} />
              {activeAlerts.length} alert aktif
            </div>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Total Net Worth"
          value={formatIDR(totalMarketValue || 562590000)}
          sub="+Rp 35.2 jt bulan ini"
          subUp={true}
          icon={<TrendingUp size={18} />}
          accent="cyan"
        />
        <KpiCard
          label="Unrealized P/L (30d)"
          value={formatIDR(Math.abs(totalUnrealized) || 28450000)}
          sub={formatPercent((totalUnrealized / (totalMarketValue || 1)) * 100 || 5.2) + " dari modal"}
          subUp={isPositive}
          icon={isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          accent={isPositive ? "green" : "red"}
          valueColor={isPositive ? "text-success" : "text-danger"}
          prefix={isPositive ? "+" : "-"}
        />
        <KpiCard
          label="Realized P/L (30d)"
          value={"+" + formatIDR(12300000)}
          sub="dari transaksi SELL"
          subUp={true}
          icon={<Target size={18} />}
          accent="blue"
          valueColor="text-success"
        />
        <KpiCard
          label="Aset Aktif"
          value={String(assets.length || 6)}
          sub={`${allocationData.length} kategori`}
          icon={<AlertTriangle size={18} />}
          accent="yellow"
        />
      </div>

      {/* Chart + Allocation */}
      <div className="grid grid-cols-3 gap-4">
        {/* Net Worth Chart */}
        <div className="col-span-2 bg-card border border-subtle rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs font-semibold text-subtle uppercase tracking-wider mb-1">Net Worth Over Time</div>
              <div className="font-display font-bold text-2xl text-foreground">{formatIDR(562590000)}</div>
            </div>
            <div className="flex gap-1 bg-bg2 rounded-sm p-1">
              {["7d","30d","YTD","All"].map(p => (
                <button key={p} className="px-3 py-1.5 rounded text-xs font-medium text-muted hover:text-foreground transition-colors first:bg-card2 first:text-foreground">
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MOCK_CHART}>
              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38d1f0" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#38d1f0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fontSize: 11, fill: "#5a5f80" }} axisLine={false} tickLine={false} />
              <YAxis tick={false} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#161929", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => [formatIDR(v), "Net Worth"]}
                labelStyle={{ color: "#8b8fb5" }}
              />
              <Line type="monotone" dataKey="v" stroke="#38d1f0" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Donut */}
        <div className="bg-card border border-subtle rounded-lg p-6">
          <div className="text-xs font-semibold text-subtle uppercase tracking-wider mb-5">Alokasi Portofolio</div>
          {allocationData.length > 0 ? (
            <>
              <div className="flex justify-center mb-4">
                <PieChart width={140} height={140}>
                  <Pie data={allocationData} cx={65} cy={65} innerRadius={44} outerRadius={65} dataKey="value" strokeWidth={0}>
                    {allocationData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </div>
              <div className="space-y-2.5">
                {allocationData.map((a) => (
                  <div key={a.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                      {a.label}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {totalMarketValue > 0 ? Math.round((a.value / totalMarketValue) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <MockAllocation />
          )}
        </div>
      </div>

      {/* Strategic Monitor */}
      <div className="bg-card border border-subtle rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            <span className="font-semibold text-foreground">Strategic Monitor</span>
          </div>
          <a href="/portfolio" className="text-xs text-cyan hover:underline">Lihat Semua →</a>
        </div>

        {assets.length > 0 ? (
          <StrategyTable assets={assets} />
        ) : (
          <MockStrategyTable />
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-subtle rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <span className="font-semibold text-foreground">Transaksi Terakhir</span>
          <a href="/history" className="text-xs text-cyan hover:underline">Lihat History →</a>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-subtle last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                    tx.type === "BUY" ? "bg-success/15 text-success" :
                    tx.type === "SELL" ? "bg-danger/15 text-danger" :
                    "bg-cyan-dim text-cyan"
                  }`}>{tx.type}</div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{tx.asset?.symbol ?? "-"}</div>
                    <div className="text-xs text-subtle">{new Date(tx.date).toLocaleDateString("id-ID")}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono-custom text-foreground">
                    {tx.quantity ? `${Number(tx.quantity).toLocaleString()} lot` : formatIDR(Number(tx.amount ?? 0))}
                  </div>
                  <div className="text-xs text-subtle">@ {tx.price ? formatIDR(Number(tx.price)) : "-"}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <MockTransactions />
        )}
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, subUp, icon, accent, valueColor, prefix }: any) {
  const accentMap: Record<string, string> = {
    cyan: "bg-cyan-dim text-cyan",
    green: "bg-success/10 text-success",
    red: "bg-danger/10 text-danger",
    blue: "bg-accent/10 text-accent",
    yellow: "bg-warning/10 text-warning",
  }
  return (
    <div className="bg-card border border-subtle rounded-lg p-5 hover:border-white/12 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-semibold text-subtle uppercase tracking-wider">{label}</div>
        <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${accentMap[accent] || ""}`}>
          {icon}
        </div>
      </div>
      <div className={`font-display font-bold text-2xl mb-1.5 ${valueColor || "text-foreground"}`}>
        {prefix}{value}
      </div>
      {sub && (
        <div className={`text-xs flex items-center gap-1 ${subUp === true ? "text-success" : subUp === false ? "text-danger" : "text-subtle"}`}>
          {subUp === true ? "↑" : subUp === false ? "↓" : ""} {sub}
        </div>
      )}
    </div>
  )
}

function StrategyTable({ assets }: { assets: any[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          {["Aset", "Harga Terakhir", "Avg. Cost", "Target (TP)", "Stop Loss", "Unrealized P/L", "Status"].map(h => (
            <th key={h} className="text-left text-xs font-semibold text-subtle uppercase tracking-wider pb-3 pr-4">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {assets.slice(0, 5).map((a) => {
          const last = Number(a.prices?.[0]?.close ?? a.avgCost ?? 0)
          const avg = Number(a.avgCost ?? 0)
          const qty = Number(a.quantity ?? 0)
          const { amount, percent } = calcUnrealizedPL(qty, avg, last)
          const tp = Number(a.targetPrice ?? 0)
          const sl = Number(a.stopLossPrice ?? 0)
          const atTP = tp > 0 && last >= tp
          const atSL = sl > 0 && last <= sl
          const nearTP = tp > 0 && last >= tp * 0.9
          const status = atTP || atSL ? (atSL ? "EXIT" : "TAKE PROFIT") : nearTP ? "DEKAT TP" : "OK"
          const statusColor = atSL ? "bg-danger/15 text-danger" : atTP || nearTP ? "bg-warning/15 text-warning" : "bg-success/10 text-success"

          return (
            <tr key={a.id} className="border-t border-subtle">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: getAssetTypeColor(a.type) + "33" }}>
                    <span style={{ color: getAssetTypeColor(a.type) }}>{a.symbol.slice(0,3)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{a.symbol}</div>
                    <div className="text-xs text-subtle">{getAssetTypeLabel(a.type)}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4 font-mono-custom text-sm text-foreground">{formatIDR(last)}</td>
              <td className="py-3 pr-4 font-mono-custom text-sm text-muted">{formatIDR(avg)}</td>
              <td className="py-3 pr-4 font-mono-custom text-sm text-cyan">{tp > 0 ? formatIDR(tp) : "—"}</td>
              <td className="py-3 pr-4 font-mono-custom text-sm text-danger">{sl > 0 ? formatIDR(sl) : "—"}</td>
              <td className="py-3 pr-4">
                <div className={`text-sm font-semibold font-mono-custom ${amount >= 0 ? "text-success" : "text-danger"}`}>
                  {amount >= 0 ? "+" : ""}{formatIDR(amount)}
                </div>
                <div className="text-xs text-subtle">{formatPercent(percent)}</div>
              </td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor}`}>{status}</span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function MockAllocation() {
  const data = [
    { label: "Saham IDX", pct: 45, color: "#22d07a" },
    { label: "Crypto", pct: 25, color: "#f5b731" },
    { label: "Emas", pct: 20, color: "#f5832f" },
    { label: "Obligasi (ORI)", pct: 10, color: "#38d1f0" },
  ]
  return (
    <>
      <div className="flex justify-center mb-4">
        <PieChart width={140} height={140}>
          <Pie data={data.map(d => ({ ...d, value: d.pct }))} cx={65} cy={65} innerRadius={44} outerRadius={65} dataKey="value" strokeWidth={0}>
            {data.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
        </PieChart>
      </div>
      <div className="space-y-2.5">
        {data.map(d => (
          <div key={d.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
              {d.label}
            </div>
            <span className="text-sm font-semibold text-foreground">{d.pct}%</span>
          </div>
        ))}
      </div>
    </>
  )
}

function MockStrategyTable() {
  const rows = [
    { sym: "BBCA", type: "Saham", last: "9.250", avg: "8.500", tp: "11.000", sl: "7.800", pl: "+Rp 8.750.000", plPct: "+8.8%", status: "OK", statusColor: "bg-success/10 text-success" },
    { sym: "BTC", type: "Crypto", last: "$64.230", avg: "$28.000", tp: "$90.000", sl: "$22.000", pl: "+Rp 52.180.000", plPct: "+129%", status: "OK", statusColor: "bg-success/10 text-success" },
    { sym: "EMAS", type: "Emas", last: "Rp 1.135.000", avg: "Rp 980.000", tp: "Rp 1.300.000", sl: "Rp 900.000", pl: "+Rp 7.750.000", plPct: "+15.8%", status: "OK", statusColor: "bg-success/10 text-success" },
    { sym: "ORI024", type: "Obligasi", last: "Rp 1.000.000", avg: "Rp 1.000.000", tp: "—", sl: "—", pl: "+Rp 2.812.500", plPct: "Kupon 6.75%", status: "TAHAN", statusColor: "bg-cyan-dim text-cyan" },
  ]
  return (
    <table className="w-full">
      <thead>
        <tr>
          {["Aset", "Harga Terakhir", "Avg. Cost", "Target (TP)", "Stop Loss", "Unrealized P/L", "Status"].map(h => (
            <th key={h} className="text-left text-xs font-semibold text-subtle uppercase tracking-wider pb-3 pr-4">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.sym} className="border-t border-subtle">
            <td className="py-3 pr-4">
              <div className="text-sm font-semibold text-foreground">{r.sym}</div>
              <div className="text-xs text-subtle">{r.type}</div>
            </td>
            <td className="py-3 pr-4 font-mono-custom text-sm text-foreground">{r.last}</td>
            <td className="py-3 pr-4 font-mono-custom text-sm text-muted">{r.avg}</td>
            <td className="py-3 pr-4 font-mono-custom text-sm text-cyan">{r.tp}</td>
            <td className="py-3 pr-4 font-mono-custom text-sm text-danger">{r.sl}</td>
            <td className="py-3 pr-4">
              <div className="text-sm font-semibold text-success">{r.pl}</div>
              <div className="text-xs text-subtle">{r.plPct}</div>
            </td>
            <td className="py-3">
              <span className={"px-2 py-1 rounded text-xs font-bold " + r.statusColor}>{r.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function MockTransactions() {
  const txs = [
    { type: "BUY", sym: "BBCA", date: "12 Jun 2025", qty: "1.000 lot", price: "Rp 9.100" },
    { type: "SELL", sym: "TLKM", date: "8 Jun 2025", qty: "500 lot", price: "Rp 3.840" },
    { type: "COUPON", sym: "ORI024", date: "1 Jun 2025", qty: "—", price: "Rp 2.812.500" },
    { type: "BUY", sym: "BTC", date: "28 Mei 2025", qty: "0.05 BTC", price: "$62.100" },
  ]
  return (
    <div className="space-y-3">
      {txs.map((tx, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-subtle last:border-0">
          <div className="flex items-center gap-3">
            <div className={"px-2 py-0.5 rounded text-xs font-bold " + (tx.type === "BUY" ? "bg-success/15 text-success" : tx.type === "SELL" ? "bg-danger/15 text-danger" : "bg-cyan-dim text-cyan")}>
              {tx.type}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{tx.sym}</div>
              <div className="text-xs text-subtle">{tx.date}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono-custom text-foreground">{tx.qty}</div>
            <div className="text-xs text-subtle">@ {tx.price}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
