
"use client"
import { useState } from "react"
import { Save, Upload } from "lucide-react"

export function SettingsClient({ userName, userEmail, userImage }: { userName: string; userEmail: string; userImage: string | null }) {
  const [name, setName] = useState(userName)
  const [saved, setSaved] = useState(false)
  const [tpAlert, setTpAlert] = useState(15)
  const [slAlert, setSlAlert] = useState(-8)
  const [exitAlert, setExitAlert] = useState(-12)
  const [alloc, setAlloc] = useState({ saham: 45, crypto: 25, emas: 20, obligasi: 10 })

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Settings</h1>
          <p className="text-muted text-sm mt-0.5">Kelola preferensi dan konfigurasi dashboard</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 bg-gradient-to-r from-accent to-cyan text-white font-semibold text-sm px-5 py-2.5 rounded-sm hover:opacity-90 glow-blue transition-all">
          <Save size={14} />
          {saved ? "✓ Tersimpan!" : "Simpan Perubahan"}
        </button>
      </div>

      {/* Profile */}
      <div className="bg-card border border-subtle rounded-lg p-6">
        <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">👤 Profil</h2>
        <div className="flex items-center gap-5 mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan to-accent flex items-center justify-center text-white font-bold text-xl overflow-hidden">
            {userImage ? <img src={userImage} alt="" className="w-full h-full object-cover" /> : name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-foreground">{name}</div>
            <div className="text-sm text-muted">{userEmail}</div>
            <button className="text-xs text-cyan mt-1 flex items-center gap-1 hover:underline"><Upload size={11} /> Ganti foto</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-subtle font-semibold uppercase tracking-wider block mb-2">Nama Tampilan</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-bg2 border border-subtle rounded-sm px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan/50 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-subtle font-semibold uppercase tracking-wider block mb-2">Mata Uang Dasar</label>
            <select className="w-full bg-bg2 border border-subtle rounded-sm px-3 py-2.5 text-sm text-foreground outline-none">
              <option>IDR - Rupiah Indonesia</option>
              <option>USD - US Dollar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-card border border-subtle rounded-lg p-6">
        <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">🔔 Alert Threshold</h2>
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: "Take Profit Soon", key: "tp", val: tpAlert, set: setTpAlert, color: "text-success", bg: "bg-success/10" },
            { label: "SL Warning", key: "sl", val: slAlert, set: setSlAlert, color: "text-warning", bg: "bg-warning/10" },
            { label: "Exit Now", key: "exit", val: exitAlert, set: setExitAlert, color: "text-danger", bg: "bg-danger/10" },
          ].map(a => (
            <div key={a.key}>
              <label className={"text-xs font-bold uppercase tracking-wider block mb-2 " + a.color}>{a.label}</label>
              <div className={"flex items-center gap-2 rounded-sm px-3 py-2.5 " + a.bg}>
                <input type="number" value={a.val} onChange={e => a.set(Number(e.target.value))}
                  className="w-full bg-transparent outline-none text-lg font-mono-custom font-bold text-foreground" />
                <span className="text-muted font-semibold">%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-cyan-dim border border-cyan/20 rounded text-xs text-muted">
          ℹ️ Alert dipicu berdasarkan perubahan harga EOD. Notifikasi tersedia via in-app.
        </div>
      </div>

      {/* Target Allocation */}
      <div className="bg-card border border-subtle rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2">🎯 Target Alokasi</h2>
          <span className={"text-xs font-bold px-2 py-1 rounded " +
            (Object.values(alloc).reduce((s,v) => s+v, 0) === 100 ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
            Total: {Object.values(alloc).reduce((s,v) => s+v, 0)}%
          </span>
        </div>
        <div className="space-y-5">
          {[
            { label: "Saham IDX", key: "saham" as const, color: "#22d07a" },
            { label: "Crypto", key: "crypto" as const, color: "#f5b731" },
            { label: "Emas Antam/UBS", key: "emas" as const, color: "#f5832f" },
            { label: "Obligasi / ORI", key: "obligasi" as const, color: "#38d1f0" },
          ].map(a => (
            <div key={a.key}>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted">{a.label}</span>
                <span className="text-sm font-semibold" style={{ color: a.color }}>{alloc[a.key]}%</span>
              </div>
              <input type="range" min={0} max={100} value={alloc[a.key]}
                onChange={e => setAlloc({...alloc, [a.key]: Number(e.target.value)})}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, ${a.color} ${alloc[a.key]}%, rgba(255,255,255,0.08) ${alloc[a.key]}%)` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
