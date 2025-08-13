const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View verification statistics")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, supabase) {
    const guildId = interaction.guild.id

    try {
      // Get verification stats
      const { data: totalVerifications } = await supabase
        .from("verification_logs")
        .select("*", { count: "exact" })
        .eq("guild_id", guildId)
        .eq("status", "verified")

      const { data: totalKicks } = await supabase
        .from("verification_logs")
        .select("*", { count: "exact" })
        .eq("guild_id", guildId)
        .eq("status", "kicked")

      // Get recent verifications (last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: recentVerifications } = await supabase
        .from("verification_logs")
        .select("*", { count: "exact" })
        .eq("guild_id", guildId)
        .eq("status", "verified")
        .gte("created_at", yesterday)

      // Get pending verifications
      const { data: pendingVerifications } = await supabase
        .from("pending_verifications")
        .select("*", { count: "exact" })
        .eq("guild_id", guildId)
        .gt("expires_at", new Date().toISOString())

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("📊 Verification Statistics")
        .addFields(
          { name: "✅ Total Verifications", value: totalVerifications?.count?.toString() || "0", inline: true },
          { name: "👢 Total Auto-Kicks", value: totalKicks?.count?.toString() || "0", inline: true },
          { name: "🕐 Recent (24h)", value: recentVerifications?.count?.toString() || "0", inline: true },
          { name: "⏳ Pending", value: pendingVerifications?.count?.toString() || "0", inline: true },
          { name: "👥 Server Members", value: interaction.guild.memberCount.toString(), inline: true },
          {
            name: "📈 Success Rate",
            value: `${totalVerifications?.count > 0 ? Math.round((totalVerifications.count / (totalVerifications.count + (totalKicks?.count || 0))) * 100) : 0}%`,
            inline: true,
          },
        )
        .setFooter({ text: "Statistics updated in real-time" })
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      console.error("Error fetching stats:", error)
      await interaction.reply({
        content: "❌ Failed to fetch verification statistics!",
        ephemeral: true,
      })
    }
  },
}
