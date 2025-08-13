"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, UserCheck, UserX, MoreHorizontal } from "lucide-react"
import { useState, useEffect } from "react"

interface Member {
  id: string
  username: string
  discriminator: string
  verified: boolean
  joinedAt: string
  lastActivity: string
}

export default function MemberManagement() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setMembers([
          {
            id: "1",
            username: "user123",
            discriminator: "1234",
            verified: true,
            joinedAt: "2024-01-15",
            lastActivity: "2 hours ago",
          },
          {
            id: "2",
            username: "newmember",
            discriminator: "5678",
            verified: false,
            joinedAt: "2024-01-20",
            lastActivity: "5 minutes ago",
          },
          {
            id: "3",
            username: "testuser",
            discriminator: "9012",
            verified: true,
            joinedAt: "2024-01-10",
            lastActivity: "1 day ago",
          },
        ])
      } catch (error) {
        console.error("Failed to fetch members:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const filteredMembers = members.filter((member) => member.username.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white font-montserrat">Search Members</CardTitle>
          <CardDescription className="text-gray-400 font-open-sans">Find and manage specific members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white font-montserrat">Members ({filteredMembers.length})</CardTitle>
          <CardDescription className="text-gray-400 font-open-sans">
            Manage verification status and member roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border border-gray-700 rounded-lg">
                  <div className="h-10 w-10 bg-gray-700 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
                    <div className="h-3 bg-gray-700 rounded w-24 animate-pulse" />
                  </div>
                  <div className="h-8 bg-gray-700 rounded w-20 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-4 p-4 border border-gray-700 rounded-lg hover:border-green-700 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-700 text-gray-300">
                      {member.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white font-open-sans">
                      {member.username}#{member.discriminator}
                    </p>
                    <p className="text-xs text-gray-400 font-open-sans">
                      Joined {member.joinedAt} • Last active {member.lastActivity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={
                        member.verified
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }
                    >
                      {member.verified ? "Verified" : "Unverified"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    >
                      {member.verified ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          Unverify
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Verify
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
