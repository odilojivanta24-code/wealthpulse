
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SettingsClient } from "@/components/portfolio/SettingsClient"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  return (
    <SettingsClient
      userName={session!.user!.name ?? ""}
      userEmail={session!.user!.email ?? ""}
      userImage={(session!.user as any).image ?? null}
    />
  )
}
