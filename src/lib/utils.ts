import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(amount: number, decimals = 2): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

export function calcWAC(
  oldQty: number,
  oldAvg: number,
  buyQty: number,
  buyPrice: number,
  fee: number = 0
): number {
  const newQty = oldQty + buyQty
  if (newQty === 0) return 0
  return (oldQty * oldAvg + buyQty * buyPrice + fee) / newQty
}

export function calcUnrealizedPL(
  quantity: number,
  avgCost: number,
  lastPrice: number
): { amount: number; percent: number } {
  const amount = (lastPrice - avgCost) * quantity
  const percent = avgCost > 0 ? ((lastPrice - avgCost) / avgCost) * 100 : 0
  return { amount, percent }
}

export function calcRealizedPL(
  sellQty: number,
  sellPrice: number,
  avgCost: number,
  fee: number = 0,
  tax: number = 0
): number {
  return (sellPrice - avgCost) * sellQty - fee - tax
}

export function getAssetTypeLabel(type: string): string {
  const map: Record<string, string> = {
    STOCK: "Saham",
    CRYPTO: "Crypto",
    BOND: "Obligasi",
    ETF: "ETF",
    GOLD: "Emas",
    CASH: "Cash",
  }
  return map[type] || type
}

export function getAssetTypeColor(type: string): string {
  const map: Record<string, string> = {
    STOCK: "#22d07a",
    CRYPTO: "#f5b731",
    BOND: "#38d1f0",
    ETF: "#9d7eff",
    GOLD: "#f5832f",
    CASH: "#8b8fb5",
  }
  return map[type] || "#8b8fb5"
}
