import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatIDR, formatPercent, calculateWAC, calculateUnrealizedPnL, getAlertStatus } from '@/lib/calculations'
import NetWorthChart from '@/components/charts/NetWorthChart'
import AllocationDonut from '@/components/charts/AllocationDonut'
import StrategicMonitor from '@/components/dashboard/StrategicMonitor'
import KpiCard from '@/components/dashboard/KpiCard'
import AlertBanner from '@/components/dashboard/AlertBanner'
import WeeklyNote from '@/components/dashboard/WeeklyNote'

export const revalidate = 300 // refresh every 5 minutes

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id as string

  // Fetch all active assets with latest prices and transactions
  const assets = await prisma.asset.findMany({
    where: { userId, isActive: true },
    include: {
      transactions: { orderBy: { date: 'asc' } },
      prices: {
        orderBy: { ts: 'desc' },
        take: 1,
      },
      alerts: { where: { status: 'ACTIVE' } },
    },
  })

  // Compute positions
  let totalMarketValue = 0
  let totalCost = 0
  let totalRealizedPnL = 0
  const allocationMap: Record<string, number> = { STOCK: 0, CRYPTO: 0, GOLD: 0, BOND: 0, CASH: 0 }
  const strategicAssets = []
  const alertAssets = []

  for (const asset of assets) {
    const txs = asset.transactions.map(t => ({
      type: t.type,
      quantity: t.quantity ? Number(t.quantity) : null,
      price: t.price ? Number(t.price) : null,
      amount: t.amount ? Number(t.amount) : null,
      fee: t.fee ? Number(t.fee) : null,
      tax: t.tax ? Number(t.tax) : null,
    }))

    const wac = calculateWAC(txs)
    const lastPrice = asset.prices[0] ? Number(asset.prices[0].close) : 0
    const marketValue = wac.quantity * lastPrice
    const unrealized = calculateUnrealizedPnL(wac.quantity, wac.avgCost, lastPrice)

    totalMarketValue += marketValue
    totalCost += wac.totalCost
    totalRealizedPnL += wac.realizedPnL
    allocationMap[asset.type] = (allocationMap[asset.type] || 0) + marketValue

    // Alert status
    const alertStatus = getAlertStatus(
      lastPrice,
      asset.targetPrice ? Number(asset.targetPrice) : null,
      asset.stopLossPrice ? Number(asset.stopLossPrice) : null,
      wac.avgCost
    )

    if (alertStatus !== 'OK') {
      alertAssets.push({ symbol: asset.symbol, name: asset.name, alertStatus, lastPrice, marketValue })
    }

    if (asset.targetPrice || asset.stopLossPrice) {
      strategicAssets.push({
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        lastPrice,
        avgCost: wac.avgCost,
        quantity: wac.quantity,
        marketValue,
        unrealizedAmount: unrealized.amount,
        unrealizedPercent: unrealized.percent,
        targetPrice: asset.targetPrice ? Number(asset.targetPrice) : null,
        stopLossPrice: asset.stopLossPrice ? Number(asset.stopLossPrice) : null,
        alertStatus,
      })
    }
  }

  const totalUnrealized = totalMarketValue - totalCost
  const unrealizedPercent = totalCost > 0 ? (totalUnrealized / totalCost) * 100 : 0

  // Allocation percentages
  const totalForAlloc = Object.values(allocationMap).reduce((a, b) => a + b, 0)
  const allocation = Object.entries(allocationMap)
    .filter(([, v]) => v > 0)
    .map(([type, value]) => ({
      type,
      value,
      percent: totalForAlloc > 0 ? (value / totalForAlloc) * 100 : 0,
    }))

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Investor'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam'

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-0.5">{greeting}, {firstName} 👋</p>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Cabinet Grotesk' }}>
            Ringkasan Portofolio
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="flex items-center gap-1.5 justify-end mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Harga EOD</span>
          </div>
        </div>
      </div>

      {/* Alert banners */}
      {alertAssets.length > 0 && <AlertBanner alerts={alertAssets} />}

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Total Net Worth"
          value={formatIDR(totalMarketValue)}
          subValue={`Modal: ${formatIDR(totalCost, true)}`}
          highlight
        />
        <KpiCard
          label="Unrealized P/L"
          value={formatIDR(totalUnrealized)}
          subValue={formatPercent(unrealizedPercent)}
          positive={totalUnrealized >= 0}
          tooltip="Perubahan nilai berdasarkan harga pasar saat ini vs rata-rata harga beli (WAC)"
        />
        <KpiCard
          label="Realized P/L"
          value={formatIDR(totalRealizedPnL)}
          subValue="Sepanjang waktu"
          positive={totalRealizedPnL >= 0}
          tooltip="Keuntungan yang sudah direalisasi dari SELL + dividen + kupon ORI"
        />
        <KpiCard
          label="Total Aset Aktif"
          value={String(assets.length)}
          subValue={`${allocation.length} jenis aset`}
        />
      </div>

      {/* Chart + Allocation row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white" style={{ fontFamily: 'Cabinet Grotesk' }}>Nilai Portofolio</h3>
              <p className="text-xs text-slate-500 mt-0.5">Historis harian (30 hari terakhir)</p>
            </div>
          </div>
          <NetWorthChart userId={userId} />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white" style={{ fontFamily: 'Cabinet Grotesk' }}>Alokasi Aset</h3>
            <span className="text-xs text-slate-500">{assets.length} posisi</span>
          </div>
          <AllocationDonut data={allocation} total={totalMarketValue} />
        </div>
      </div>

      {/* Strategic Monitor */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-white" style={{ fontFamily: 'Cabinet Grotesk' }}>Strategic Monitor</h3>
            <p className="text-xs text-slate-500 mt-0.5">Status target & stop loss semua posisi</p>
          </div>
          <a href="/portfolio" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
            Lihat Semua →
          </a>
        </div>
        <StrategicMonitor assets={strategicAssets} />
      </div>

      {/* Weekly note */}
      <WeeklyNote />
    </div>
  )
}
