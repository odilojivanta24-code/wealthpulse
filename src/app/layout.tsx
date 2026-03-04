import type { Metadata } from "next"
import { DM_Sans, Syne, DM_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/layout/Providers"

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })
const syne = Syne({ subsets: ["latin"], variable: "--font-display" })
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "WealthPulse — Portfolio Investasi",
  description: "Dashboard portofolio investasi personal",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className={`${dmSans.variable} ${syne.variable} ${dmMono.variable} font-sans bg-bg text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
