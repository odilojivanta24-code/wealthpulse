import { Decimal } from '@prisma/client/runtime/library'

// Format currency in IDR
export function formatIDR(amount: number | Decimal, compact = false): string {
  const num = typeof amount === 'object' ? Number(amount) : amount
  if (compact) {
    if (Math.abs(num) >= 1_000_000_000) return `Rp${(num / 1_000_000_000).toFixed(1)}M`
    if (Math.abs(num) >= 1_000_000) return `Rp${(num / 1_000_000).toFixed(1)}jt`
    if (Math.abs(num) >= 1_000) return `Rp${(num / 1_000).toFixed(0)}rb`
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)
}

// WAC (Weighted Average Cost) Calculation
export interface WACPosition {
  quantity: number
  avgCost: number
  totalCost: number
  realizedPnL: number
}

export interface Transaction {
  type: string
  quantity?: number | null
  price?: number | null
  amount?: number | null
  fee?: number | null
  tax?: number | null
}

export function calculateWAC(transactions: Transaction[]): WACPosition {
  let quantity = 0
  let totalCost = 0
  let realizedPnL = 0

  // Sort by date (assumed sorted already from DB)
  for (const tx of transactions) {
    const qty = Number(tx.quantity ?? 0)
    const price = Number(tx.price ?? 0)
    const fee = Number(tx.fee ?? 0)
    const tax = Number(tx.tax ?? 0)

    if (tx.type === 'BUY') {
      const buyCost = qty * price + fee
      totalCost += buyCost
      quantity += qty
    } else if (tx.type === 'SELL') {
      if (quantity <= 0) continue
      const avgCostPerUnit = totalCost / quantity
      const sellRevenue = qty * price - fee - tax
      const costBasis = qty * avgCostPerUnit
      realizedPnL += sellRevenue - costBasis
      totalCost -= costBasis
      quantity -= qty
      if (quantity < 0.000001) {
        quantity = 0
        totalCost = 0
      }
    } else if (tx.type === 'DIVIDEND' || tx.type === 'COUPON') {
      realizedPnL += Number(tx.amount ?? 0)
    } else if (tx.type === 'FEE' || tx.type === 'TAX') {
      realizedPnL -= Number(tx.amount ?? 0)
    }
  }

  const avgCost = quantity > 0 ? totalCost / quantity : 0
  return { quantity, avgCost, totalCost, realizedPnL }
}

export function calculateUnrealizedPnL(
  quantity: number,
  avgCost: number,
  lastPrice: number
): { amount: number; percent: number } {
  if (quantity <= 0 || avgCost <= 0) return { amount: 0, percent: 0 }
  const amount = (lastPrice - avgCost) * quantity
  const percent = ((lastPrice - avgCost) / avgCost) * 100
  return { amount, percent }
}

export function getAlertStatus(
  lastPrice: number,
  targetPrice?: number | null,
  stopLossPrice?: number | null,
  avgCost?: number | null
): 'TAKE_PROFIT' | 'STOP_LOSS' | 'TP_SOON' | 'SL_WARNING' | 'OK' {
  if (!lastPrice) return 'OK'

  if (targetPrice && lastPrice >= targetPrice) return 'TAKE_PROFIT'
  if (stopLossPrice && lastPrice <= stopLossPrice) return 'STOP_LOSS'

  if (targetPrice && lastPrice >= targetPrice * 0.95) return 'TP_SOON'
  if (stopLossPrice && lastPrice <= stopLossPrice * 1.05) return 'SL_WARNING'

  return 'OK'
}

export function distanceToTarget(lastPrice: number, targetPrice: number): number {
  if (!targetPrice || !lastPrice) return 0
  return ((lastPrice - (targetPrice > lastPrice ? 0 : targetPrice)) / targetPrice) * 100
}

export function progressToTarget(lastPrice: number, avgCost: number, targetPrice: number): number {
  if (!targetPrice || !avgCost || !lastPrice) return 0
  if (targetPrice <= avgCost) return 100
  return Math.min(100, Math.max(0, ((lastPrice - avgCost) / (targetPrice - avgCost)) * 100))
}
