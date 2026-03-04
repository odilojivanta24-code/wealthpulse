
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { HistoryClient } from "@/components/portfolio/HistoryClient"

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { asset: true },
  })

  return <HistoryClient transactions={JSON.parse(JSON.stringify(transactions))} />
}
