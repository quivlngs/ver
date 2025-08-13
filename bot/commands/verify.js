const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Manually verify a user (Admin only)")
    .addUserOption((option) => option.setName("user").setDescription("User to verify").setRequired(true))
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for manual verification").setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const { supabase } = interaction.client
    const targetUser = interaction.options.getUser("user")
    const reason = interaction.options.getString("reason") || "Manual verification by moderator"
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
          content: "Verification system is not set up for this server. Use `/setup` first.",
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

      // Check if user is already verified
      if (member.roles.cache.has(guildConfig.verified_role_id)) {
        return interaction.reply({
          content: "User is already verified.",
          ephemeral: true,
        })
      }

      // Add verified role
      await member.roles.add(guildConfig.verified_role_id)

      // Remove unverified role if it exists
      if (guildConfig.unverified_role_id && member.roles.cache.has(guildConfig.unverified_role_id)) {
        await member.roles.remove(guildConfig.unverified_role_id)
      }

      // Log verification
      await supabase.from("verification_logs").insert({
        guild_id: guildId,
        user_id: targetUser.id,
        username: targetUser.username,
        verification_type: "manual",
        status: "verified",
        verified_at: new Date().toISOString(),
        attempt_count: 1,
      })

      // Remove from pending verifications if exists
      await supabase.from("pending_verifications").delete().eq("guild_id", guildId).eq("user_id", targetUser.id)

      // Success embed
      const embed = new EmbedBuilder()
        .setTitle("✅ User Verified Successfully")
        .setDescription(`${targetUser.toString()} has been manually verified.`)
        .addFields(
          { name: "User", value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: "Verified By", value: interaction.user.tag, inline: true },
          { name: "Reason", value: reason, inline: false },
        )
        .setColor(0x00ff00)
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })

      // Send DM to verified user
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle("🎉 Verification Complete")
          .setDescription(`You have been verified in **${interaction.guild.name}**!`)
          .addFields(
            { name: "Verified By", value: "Server Moderator", inline: true },
            { name: "Access Granted", value: "You now have full access to the server.", inline: false },
          )
          .setColor(0x00ff00)
          .setTimestamp()

        await targetUser.send({ embeds: [dmEmbed] })
      } catch (dmError) {
        console.log("Could not send DM to verified user:", dmError.message)
      }
    } catch (error) {
      console.error("Manual verify error:", error)
      await interaction.reply({
        content: "An error occurred while verifying the user.",
        ephemeral: true,
      })
    }
  },
}
