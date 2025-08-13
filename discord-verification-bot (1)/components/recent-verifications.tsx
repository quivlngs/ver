"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface Verification {
  id: string
  username: string
  status: "verified" | "failed" | "pending"
  timestamp: string
  method: "button" | "code" | "website"
}

export default function RecentVerifications() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        // Mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 800))
        setVerifications([
          {
            id: "1",
            username: "user123",
            status: "verified",
            timestamp: "2 minutes ago",
            method: "website",
          },
          {
            id: "2",
            username: "newmember",
            status: "verified",
            timestamp: "5 minutes ago",
            method: "button",
          },
          {
            id: "3",
            username: "testuser",
            status: "pending",
            timestamp: "8 minutes ago",
            method: "code",
          },
          {
            id: "4",
            username: "member456",
            status: "failed",
            timestamp: "12 minutes ago",
            method: "website",
          },
          {
            id: "5",
            username: "discord_user",
            status: "verified",
            timestamp: "15 minutes ago",
            method: "button",
          },
        ])
      } catch (error) {
        console.error("Failed to fetch verifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVerifications()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Verified</Badge>
      case "failed":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Failed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Pending</Badge>
      default:
        return null
    }
  }

  const getMethodBadge = (method: string) => {
    const colors = {
      button: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      code: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      website: "bg-green-500/10 text-green-400 border-green-500/20",
    }
    return <Badge className={colors[method as keyof typeof colors]}>{method}</Badge>
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white font-montserrat">Recent Verifications</CardTitle>
        <CardDescription className="text-gray-400 font-open-sans">
          Latest verification attempts and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
                  <div className="h-3 bg-gray-700 rounded w-32 animate-pulse" />
                </div>
                <div className="h-6 bg-gray-700 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map((verification) => (
              <div
                key={verification.id}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gray-700 text-gray-300">
                    {verification.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white font-open-sans truncate">{verification.username}</p>
                  <p className="text-xs text-gray-400 font-open-sans">{verification.timestamp}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getMethodBadge(verification.method)}
                  {getStatusBadge(verification.status)}
                  {getStatusIcon(verification.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
