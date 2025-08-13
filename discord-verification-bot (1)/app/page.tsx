import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, BarChart3, Users, Settings, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <h1 className="text-2xl font-bold mb-4 text-white">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-700 rounded-full">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-black text-white mb-6 font-montserrat">Verification Bot Management</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-open-sans">
            Monitor your guild's activity with real-time statistics. Effortlessly manage member roles and verification
            statuses.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button className="bg-green-700 hover:bg-green-600 text-white px-8 py-3 text-lg">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button
                variant="outline"
                className="border-green-700 text-green-700 hover:bg-green-700 hover:text-white px-8 py-3 text-lg bg-transparent"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gray-800 border-gray-700 hover:border-green-700 transition-colors">
            <CardHeader>
              <div className="p-3 bg-green-700 rounded-lg w-fit mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white font-montserrat">Real-time Statistics</CardTitle>
              <CardDescription className="text-gray-400">
                Monitor verification rates, member activity, and server growth with comprehensive analytics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-green-700 transition-colors">
            <CardHeader>
              <div className="p-3 bg-green-700 rounded-lg w-fit mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white font-montserrat">Member Management</CardTitle>
              <CardDescription className="text-gray-400">
                Easily manage member roles, verification statuses, and handle bulk operations efficiently.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-green-700 transition-colors">
            <CardHeader>
              <div className="p-3 bg-green-700 rounded-lg w-fit mb-4">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white font-montserrat">Guild Configuration</CardTitle>
              <CardDescription className="text-gray-400">
                Customize your verification process to suit your community's needs with flexible settings.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-3xl font-black text-white mb-4 font-montserrat">
                Ready to streamline your Discord server?
              </h2>
              <p className="text-gray-300 mb-6 font-open-sans">
                Join thousands of server administrators who trust our verification bot management system.
              </p>
              <Link href="/auth/sign-up">
                <Button className="bg-green-700 hover:bg-green-600 text-white px-8 py-3 text-lg">
                  Start Managing Today
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
