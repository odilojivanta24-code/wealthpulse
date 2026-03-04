import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardClient } from "@/components/dashboard/DashboardClient"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const [assets, recentTransactions, activeAlerts] = await Promise.all([
    prisma.asset.findMany({
      where: { userId, isActive: true },
      include: { prices: { orderBy: { ts: "desc" }, take: 1 } },
    }),
    prisma.transaction.findMany({
      where: { userId }, orderBy: { date: "desc" }, take: 10,
      include: { asset: true },
    }),
    prisma.alertRule.findMany({
      where: { userId, status: "ACTIVE" },
      include: { asset: true },
    }),
  ])

  return (
    <DashboardClient
      assets={JSON.parse(JSON.stringify(assets))}
      recentTransactions={JSON.parse(JSON.stringify(recentTransactions))}
      activeAlerts={JSON.parse(JSON.stringify(activeAlerts))}
      userName={session!.user!.name ?? "Investor"}
      userImage={(session!.user as any).image ?? null}
    />
  )
}
