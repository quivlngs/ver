"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Clock, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface StatsData {
  totalMembers: number
  verifiedMembers: number
  pendingVerifications: number
  verificationRate: number
  todayVerifications: number
  weeklyGrowth: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalMembers: 0,
    verifiedMembers: 0,
    pendingVerifications: 0,
    verificationRate: 0,
    todayVerifications: 0,
    weeklyGrowth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call - replace with actual API
    const fetchStats = async () => {
      try {
        // Mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setStats({
          totalMembers: 1247,
          verifiedMembers: 1089,
          pendingVerifications: 23,
          verificationRate: 87.3,
          todayVerifications: 15,
          weeklyGrowth: 12.5,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Members",
      value: stats.totalMembers.toLocaleString(),
      description: `+${stats.todayVerifications} today`,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Verified Members",
      value: stats.verifiedMembers.toLocaleString(),
      description: `${stats.verificationRate}% verification rate`,
      icon: UserCheck,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications.toString(),
      description: "Awaiting verification",
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Weekly Growth",
      value: `+${stats.weeklyGrowth}%`,
      description: "Member growth this week",
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
              <div className="h-4 w-4 bg-gray-700 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-700 rounded w-16 mb-2 animate-pulse" />
              <div className="h-3 bg-gray-700 rounded w-32 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-gray-800 border-gray-700 hover:border-green-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 font-open-sans">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-black ${stat.color} font-montserrat`}>{stat.value}</div>
            <p className="text-xs text-gray-400 font-open-sans">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
