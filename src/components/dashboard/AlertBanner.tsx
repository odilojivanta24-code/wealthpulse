'use client'

import { useState } from 'react'

interface AlertItem {
  symbol: string
  name: string | null
  alertStatus: string
  lastPrice: number
  marketValue: number
}

export default function AlertBanner({ alerts }: { alerts: AlertItem[] }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const critical = alerts.filter(a => a.alertStatus === 'TAKE_PROFIT' || a.alertStatus === 'STOP_LOSS')
  const warnings = alerts.filter(a => a.alertStatus === 'TP_SOON' || a.alertStatus === 'SL_WARNING')

  return (
    <div className="space-y-2">
      {critical.map((alert) => (
        <div key={alert.symbol} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
          alert.alertStatus === 'TAKE_PROFIT'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <span className="text-lg">{alert.alertStatus === 'TAKE_PROFIT' ? '🎯' : '⚠️'}</span>
          <div className="flex-1">
            <span className="font-bold">{alert.symbol}</span>
            {alert.alertStatus === 'TAKE_PROFIT'
              ? ' telah mencapai Target Price! Pertimbangkan untuk Take Profit.'
              : ' mendekati Stop Loss! Pertimbangkan untuk Exit.'}
          </div>
          <button onClick={() => setDismissed(true)} className="text-current opacity-50 hover:opacity-100 transition-opacity">✕</button>
        </div>
      ))}
      {warnings.map((alert) => (
        <div key={alert.symbol} className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-300 text-sm">
          <span className="text-lg">🔔</span>
          <div className="flex-1">
            <span className="font-bold">{alert.symbol}</span>
            {alert.alertStatus === 'TP_SOON'
              ? ' hampir mencapai Target Price (>95%). Siapkan rencana Take Profit.'
              : ' mendekati Stop Loss (dalam 5%). Pantau lebih sering.'}
          </div>
          <button onClick={() => setDismissed(true)} className="text-current opacity-50 hover:opacity-100 transition-opacity">✕</button>
        </div>
      ))}
    </div>
  )
}
