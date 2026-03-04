import { PrismaClient, AssetType, TxType } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@wealthpulse.app" },
    update: {},
    create: {
      email: "demo@wealthpulse.app",
      name: "Demo Investor",
      baseCurrency: "IDR",
    },
  })

  // Create sample assets
  const bbca = await prisma.asset.upsert({
    where: { userId_symbol_exchange: { userId: user.id, symbol: "BBCA", exchange: "IDX" } },
    update: {},
    create: {
      userId: user.id, type: AssetType.STOCK, symbol: "BBCA",
      name: "Bank Central Asia", exchange: "IDX", currency: "IDR",
      quantity: 1000, avgCost: 8500, targetPrice: 11000, stopLossPrice: 7800,
      notes: "Blue chip perbankan, hold jangka panjang",
    },
  })

  const btc = await prisma.asset.upsert({
    where: { userId_symbol_exchange: { userId: user.id, symbol: "BTC", exchange: "CRYPTO" } },
    update: {},
    create: {
      userId: user.id, type: AssetType.CRYPTO, symbol: "BTC",
      name: "Bitcoin", exchange: "CRYPTO", currency: "IDR",
      quantity: 0.15, avgCost: 420000000, targetPrice: 1400000000, stopLossPrice: 350000000,
      notes: "DCA strategy, target ATH baru",
    },
  })

  const ori = await prisma.asset.upsert({
    where: { userId_symbol_exchange: { userId: user.id, symbol: "ORI024", exchange: "IDX" } },
    update: {},
    create: {
      userId: user.id, type: AssetType.BOND, symbol: "ORI024",
      name: "ORI024 6.75%", exchange: "IDX", currency: "IDR",
      quantity: 25, avgCost: 1000000, couponRate: 6.75,
      maturityDate: new Date("2026-10-15"), faceValue: 1000000,
      notes: "Obligasi ritel negara, kupon tiap bulan",
    },
  })

  const emas = await prisma.asset.upsert({
    where: { userId_symbol_exchange: { userId: user.id, symbol: "EMAS", exchange: "ANTAM" } },
    update: {},
    create: {
      userId: user.id, type: AssetType.GOLD, symbol: "EMAS",
      name: "Emas Antam", exchange: "ANTAM", currency: "IDR",
      quantity: 50, avgCost: 980000, targetPrice: 1300000, stopLossPrice: 900000,
      notes: "Lindung nilai inflasi",
    },
  })

  // Sample transactions
  await prisma.transaction.createMany({
    data: [
      { userId: user.id, assetId: bbca.id, type: TxType.BUY, date: new Date("2024-03-01"), quantity: 1000, price: 8500, fee: 21250 },
      { userId: user.id, assetId: btc.id, type: TxType.BUY, date: new Date("2024-01-15"), quantity: 0.1, price: 400000000, fee: 0 },
      { userId: user.id, assetId: btc.id, type: TxType.BUY, date: new Date("2024-04-10"), quantity: 0.05, price: 460000000, fee: 0 },
      { userId: user.id, assetId: ori.id, type: TxType.BUY, date: new Date("2024-10-15"), quantity: 25, price: 1000000, fee: 0 },
      { userId: user.id, assetId: ori.id, type: TxType.COUPON, date: new Date("2024-11-15"), amount: 140625 },
      { userId: user.id, assetId: ori.id, type: TxType.COUPON, date: new Date("2024-12-15"), amount: 140625 },
      { userId: user.id, assetId: emas.id, type: TxType.BUY, date: new Date("2023-11-01"), quantity: 50, price: 980000, fee: 0 },
    ],
    skipDuplicates: true,
  })

  // Sample watchlist
  await prisma.watchlist.createMany({
    data: [
      { userId: user.id, symbol: "BBRI", name: "Bank Rakyat Indonesia", type: AssetType.STOCK, exchange: "IDX", notes: "Tunggu koreksi ke 4.500" },
      { userId: user.id, symbol: "ETH", name: "Ethereum", type: AssetType.CRYPTO, exchange: "CRYPTO", notes: "Akumulasi jika ke $2.800" },
    ],
    skipDuplicates: true,
  })

  console.log("✅ Seed selesai!")
}

main().catch(console.error).finally(() => prisma.$disconnect())
