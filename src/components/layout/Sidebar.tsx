"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard, Briefcase, History, Eye,
  TrendingUp, Settings, LogOut, PlusCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/portfolio", icon: Briefcase, label: "Portfolio" },
  { href: "/history", icon: History, label: "History" },
  { href: "/watchlist", icon: Eye, label: "Watchlist" },
  { href: "/market", icon: TrendingUp, label: "Market" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-bg2 border-r border-subtle flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-subtle">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-cyan to-accent flex items-center justify-center font-display font-bold text-sm text-white glow-cyan">
          W
        </div>
        <span className="font-display font-bold text-[17px] text-foreground">WealthPulse</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-medium transition-all",
                active
                  ? "bg-gradient-to-r from-accent to-cyan text-white glow-blue"
                  : "text-muted hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
              {label}
            </Link>
          )
        })}

        <Link
          href="/portfolio/add"
          className="flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-medium text-cyan hover:bg-cyan-dim transition-all mt-2 border border-dashed border-cyan/30"
        >
          <PlusCircle size={18} className="shrink-0" />
          Tambah Aset
        </Link>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-subtle">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-white/5 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan to-accent flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
            {session?.user?.image ? (
              <img src={session.user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              session?.user?.name?.charAt(0) ?? "U"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{session?.user?.name ?? "User"}</div>
            <div className="text-xs text-cyan">Pro Investor</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-subtle hover:text-danger"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
