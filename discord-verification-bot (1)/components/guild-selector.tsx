"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Server, Plus } from "lucide-react"
import { useState, useEffect } from "react"

interface Guild {
  id: string
  name: string
  memberCount: number
  verificationEnabled: boolean
}

export default function GuildSelector() {
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [selectedGuild, setSelectedGuild] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        // Mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 600))
        const mockGuilds = [
          {
            id: "1",
            name: "Gaming Community",
            memberCount: 1247,
            verificationEnabled: true,
          },
          {
            id: "2",
            name: "Tech Support Server",
            memberCount: 892,
            verificationEnabled: true,
          },
          {
            id: "3",
            name: "Art & Design Hub",
            memberCount: 456,
            verificationEnabled: false,
          },
        ]
        setGuilds(mockGuilds)
        if (mockGuilds.length > 0) {
          setSelectedGuild(mockGuilds[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch guilds:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGuilds()
  }, [])

  const selectedGuildData = guilds.find((g) => g.id === selectedGuild)

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white font-montserrat flex items-center gap-2">
          <Server className="h-5 w-5 text-green-400" />
          Guild Selection
        </CardTitle>
        <CardDescription className="text-gray-400 font-open-sans">
          Select a Discord server to manage verification settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="h-10 bg-gray-700 rounded animate-pulse" />
            <div className="h-16 bg-gray-700 rounded animate-pulse" />
          </div>
        ) : (
          <div className="space-y-4">
            <Select value={selectedGuild} onValueChange={setSelectedGuild}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select a server" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {guilds.map((guild) => (
                  <SelectItem key={guild.id} value={guild.id} className="text-white hover:bg-gray-600">
                    <div className="flex items-center justify-between w-full">
                      <span>{guild.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{guild.memberCount} members</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedGuildData && (
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white font-montserrat">{selectedGuildData.name}</h3>
                  <div
                    className={`px-2 py-1 rounded text-xs ${
                      selectedGuildData.verificationEnabled
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {selectedGuildData.verificationEnabled ? "Verification Active" : "Verification Disabled"}
                  </div>
                </div>
                <p className="text-sm text-gray-400 font-open-sans">{selectedGuildData.memberCount} total members</p>
              </div>
            )}

            <Button className="w-full bg-green-700 hover:bg-green-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add New Server
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
