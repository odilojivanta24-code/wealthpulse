'use client'

import { useRouter } from 'next/navigation'

export default function RemoveWatchlistButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleRemove() {
    await fetch(`/api/watchlist/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button
      onClick={handleRemove}
      className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-slate-500 hover:text-red-400"
      title="Hapus dari watchlist"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
      </svg>
    </button>
  )
}
