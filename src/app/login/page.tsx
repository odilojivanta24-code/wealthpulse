"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Mail, ChromeIcon, TrendingUp } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn("email", { email, callbackUrl: "/dashboard" })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[14px] bg-gradient-to-br from-cyan to-accent glow-cyan mb-4">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground">WealthPulse</h1>
          <p className="text-muted text-sm mt-2">Dashboard Portofolio Investasi Personal</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-subtle rounded-lg p-8">
          {sent ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="font-display font-bold text-xl text-foreground mb-2">Cek Email Kamu!</h2>
              <p className="text-muted text-sm">Link login sudah dikirim ke <strong className="text-foreground">{email}</strong></p>
            </div>
          ) : (
            <>
              <h2 className="font-display font-bold text-xl text-foreground mb-1">Selamat Datang</h2>
              <p className="text-muted text-sm mb-6">Login untuk melihat portofolio kamu</p>

              {/* Google */}
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold text-sm py-3 rounded-sm hover:bg-gray-100 transition-colors mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Lanjut dengan Google
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-subtle/30" />
                <span className="text-subtle text-xs">atau</span>
                <div className="flex-1 h-px bg-subtle/30" />
              </div>

              {/* Email */}
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div className="flex items-center gap-3 bg-bg2 border border-subtle rounded-sm px-4 py-3 focus-within:border-cyan/50 transition-colors">
                  <Mail size={15} className="text-subtle shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@kamu.com"
                    required
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-subtle"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-accent to-cyan text-white font-semibold text-sm py-3 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 glow-blue"
                >
                  {loading ? "Mengirim..." : "Kirim Magic Link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-subtle text-xs mt-6">
          Data kamu tersimpan aman & hanya bisa diakses oleh kamu sendiri.
        </p>
      </div>
    </div>
  )
}
