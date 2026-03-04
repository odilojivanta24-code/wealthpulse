
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const assets = await prisma.asset.findMany({
    where: { userId, isActive: true },
    include: { prices: { orderBy: { ts: "desc" }, take: 1 } },
  })
  return NextResponse.json(assets)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const body = await req.json()

  const asset = await prisma.asset.create({
    data: {
      userId,
      type: body.type,
      symbol: body.symbol.toUpperCase(),
      name: body.name,
      exchange: body.exchange,
      currency: body.currency ?? "IDR",
      targetPrice: body.targetPrice ? parseFloat(body.targetPrice) : null,
      stopLossPrice: body.stopLossPrice ? parseFloat(body.stopLossPrice) : null,
      notes: body.notes,
      couponRate: body.couponRate ? parseFloat(body.couponRate) : null,
      maturityDate: body.maturityDate ? new Date(body.maturityDate) : null,
      faceValue: body.faceValue ? parseFloat(body.faceValue) : null,
    },
  })
  return NextResponse.json(asset)
}
