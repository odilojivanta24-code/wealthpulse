import { AppShell } from "@/components/layout/AppShell"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AddAssetClient } from "@/components/portfolio/AddAssetClient"

export default async function AddAssetPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  return <AppShell><AddAssetClient /></AppShell>
}
