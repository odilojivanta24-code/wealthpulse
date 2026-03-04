import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import TickerBar from '@/components/layout/TickerBar'
import SessionProvider from '@/components/layout/SessionProvider'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-[#080d1a]">
        <Sidebar />
        <div className="flex-1 ml-[220px] flex flex-col min-h-screen">
          <TickerBar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
