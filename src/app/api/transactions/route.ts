
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calcWAC } from "@/lib/utils"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const body = await req.json()

  const tx = await prisma.transaction.create({
    data: {
      userId,
      assetId: body.assetId,
      type: body.type,
      date: new Date(body.date),
      quantity: body.quantity ? parseFloat(body.quantity) : null,
      price: body.price ? parseFloat(body.price) : null,
      amount: body.amount ? parseFloat(body.amount) : null,
      fee: body.fee ? parseFloat(body.fee) : null,
      tax: body.tax ? parseFloat(body.tax) : null,
      notes: body.notes,
    },
  })

  // Update cached avgCost and quantity on asset (WAC method)
  if (body.assetId && (body.type === "BUY" || body.type === "SELL")) {
    const asset = await prisma.asset.findUnique({ where: { id: body.assetId } })
    if (asset) {
      const oldQty = Number(asset.quantity ?? 0)
      const oldAvg = Number(asset.avgCost ?? 0)
      const qty = parseFloat(body.quantity)
      const price = parseFloat(body.price)
      const fee = parseFloat(body.fee ?? 0)

      let newQty = oldQty
      let newAvg = oldAvg

      if (body.type === "BUY") {
        newAvg = calcWAC(oldQty, oldAvg, qty, price, fee)
        newQty = oldQty + qty
      } else {
        newQty = Math.max(0, oldQty - qty)
        // avg cost stays same on SELL (WAC)
      }

      await prisma.asset.update({
        where: { id: body.assetId },
        data: { quantity: newQty, avgCost: newAvg },
      })
    }
  }

  return NextResponse.json(tx)
}
