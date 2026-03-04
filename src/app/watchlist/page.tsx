
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { WatchlistClient } from "@/components/portfolio/WatchlistClient"

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const watchlist = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  return <WatchlistClient watchlist={JSON.parse(JSON.stringify(watchlist))} />
}
