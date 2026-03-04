
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PortfolioClient } from "@/components/portfolio/PortfolioClient"

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const assets = await prisma.asset.findMany({
    where: { userId, isActive: true },
    include: {
      prices: { orderBy: { ts: "desc" }, take: 30 },
      transactions: { orderBy: { date: "desc" } },
      alerts: true,
    },
    orderBy: { createdAt: "asc" },
  })

  return <PortfolioClient assets={JSON.parse(JSON.stringify(assets))} />
}
