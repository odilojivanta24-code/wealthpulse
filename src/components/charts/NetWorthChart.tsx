import { prisma } from '@/lib/prisma'
import NetWorthChartClient from './NetWorthChartClient'

export default async function NetWorthChart({ userId }: { userId: string }) {
  // Get last 30 days of price data
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const assets = await prisma.asset.findMany({
    where: { userId, isActive: true },
    include: {
      transactions: { orderBy: { date: 'asc' } },
      prices: {
        where: { ts: { gte: thirtyDaysAgo }, interval: 'EOD' },
        orderBy: { ts: 'asc' },
      },
    },
  })

  // Build daily net worth series (simplified: use available price points)
  const dateMap: Record<string, number> = {}

  for (const asset of assets) {
    for (const price of asset.prices) {
      const dateKey = price.ts.toISOString().split('T')[0]
      // Find transactions up to this date
      const txsToDate = asset.transactions
        .filter(t => t.date <= price.ts)
        .map(t => ({
          type: t.type,
          quantity: t.quantity ? Number(t.quantity) : null,
          price: t.price ? Number(t.price) : null,
          amount: t.amount ? Number(t.amount) : null,
          fee: t.fee ? Number(t.fee) : null,
          tax: t.tax ? Number(t.tax) : null,
        }))

      let qty = 0
      for (const tx of txsToDate) {
        if (tx.type === 'BUY') qty += tx.quantity ?? 0
        else if (tx.type === 'SELL') qty -= tx.quantity ?? 0
      }

      const mv = qty * Number(price.close)
      dateMap[dateKey] = (dateMap[dateKey] || 0) + mv
    }
  }

  const chartData = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({
      date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      value: Math.round(value),
    }))

  return <NetWorthChartClient data={chartData} />
}
