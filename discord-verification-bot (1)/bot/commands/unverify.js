const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unverify")
    .setDescription("Remove verification from a user (Admin only)")
    .addUserOption((option) => option.setName("user").setDescription("User to unverify").setRequired(true))
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for removing verification").setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const { supabase } = interaction.client
    const targetUser = interaction.options.getUser("user")
    const reason = interaction.options.getString("reason") || "Verification removed by moderator"
    const guildId = interaction.guild.id

    try {
      // Get guild configuration
      const { data: guildConfig, error: configError } = await supabase
        .from("guilds")
        .select("*")
        .eq("id", guildId)
        .single()

      if (configError || !guildConfig) {
        return interaction.reply({
          content: "Verification system is not set up for this server.",
          ephemeral: true,
        })
      }

      // Get guild member
      const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null)
      if (!member) {
        return interaction.reply({
          content: "User is not a member of this server.",
          ephemeral: true,
        })
      }

      // Check if user is verified
      if (!member.roles.cache.has(guildConfig.verified_role_id)) {
        return interaction.reply({
          content: "User is not currently verified.",
          ephemeral: true,
        })
      }

      // Remove verified role
      await member.roles.remove(guildConfig.verified_role_id)

      // Add unverified role if configured
      if (guildConfig.unverified_role_id) {
        await member.roles.add(guildConfig.unverified_role_id)
      }

      // Log unverification
      await supabase.from("verification_logs").insert({
        guild_id: guildId,
        user_id: targetUser.id,
        username: targetUser.username,
        verification_type: "manual_removal",
        status: "unverified",
        verified_at: null,
        attempt_count: 1,
      })

      // Success embed
      const embed = new EmbedBuilder()
        .setTitle("❌ User Unverified")
        .setDescription(`${targetUser.toString()} has been unverified.`)
        .addFields(
          { name: "User", value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: "Unverified By", value: interaction.user.tag, inline: true },
          { name: "Reason", value: reason, inline: false },
        )
        .setColor(0xff0000)
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      console.error("Unverify error:", error)
      await interaction.reply({
        content: "An error occurred while unverifying the user.",
        ephemeral: true,
      })
    }
  },
}
