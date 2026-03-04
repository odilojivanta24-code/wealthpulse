export default function WeeklyNote() {
  const now = new Date()
  const weekNum = Math.ceil(now.getDate() / 7)
  const month = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  return (
    <div className="card p-5 border-l-2 border-l-cyan-500/50">
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">📝</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'Cabinet Grotesk' }}>
              Catatan Mingguan
            </h3>
            <span className="text-[10px] badge-cyan px-2 py-0.5 rounded-full">
              Minggu {weekNum} — {month}
            </span>
          </div>
          <textarea
            className="w-full bg-transparent text-sm text-slate-400 placeholder:text-slate-600 outline-none resize-none"
            rows={2}
            placeholder="Tuliskan catatan strategi, observasi pasar, atau rencana investasi minggu ini..."
          />
        </div>
      </div>
    </div>
  )
}
