import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { guildId, userId, email } = await request.json()

    if (!guildId || !userId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if verification is pending
    const { data: pending } = await supabase
      .from("pending_verifications")
      .select("*")
      .eq("guild_id", guildId)
      .eq("user_id", userId)
      .single()

    if (!pending) {
      return NextResponse.json({ error: "No pending verification found" }, { status: 404 })
    }

    // Check if expired
    if (new Date(pending.expires_at) < new Date()) {
      return NextResponse.json({ error: "Verification expired" }, { status: 410 })
    }

    // Mark as verified in database
    await supabase.from("verification_logs").insert({
      guild_id: guildId,
      user_id: userId,
      username: pending.username,
      email: email,
      verification_method: "website",
      verified_at: new Date().toISOString(),
      status: "verified",
    })

    // Remove from pending
    await supabase.from("pending_verifications").delete().eq("guild_id", guildId).eq("user_id", userId)

    // Notify Discord bot via webhook or database flag
    await supabase.from("verification_queue").insert({
      guild_id: guildId,
      user_id: userId,
      action: "verify",
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
