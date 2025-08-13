import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardStats from "@/components/dashboard-stats"
import RecentVerifications from "@/components/recent-verifications"
import GuildSelector from "@/components/guild-selector"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, Users } from "lucide-react"
import { signOut } from "@/lib/actions"
import Link from "next/link"

export default async function Dashboard() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <h1 className="text-2xl font-bold mb-4 text-white">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white font-montserrat">Verification Bot Management</h1>
              <p className="text-gray-400 font-open-sans">Welcome back, {user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/members">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  Members
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Guild Selector */}
          <GuildSelector />

          {/* Statistics */}
          <DashboardStats />

          {/* Recent Activity */}
          <RecentVerifications />
        </div>
      </main>
    </div>
  )
}
