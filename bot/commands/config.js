const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure verification system settings")
    .addSubcommand((subcommand) => subcommand.setName("view").setDescription("View current configuration"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("autokick")
        .setDescription("Configure auto-kick settings")
        .addBooleanOption((option) =>
          option.setName("enabled").setDescription("Enable or disable auto-kick").setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("time")
            .setDescription("Time in minutes before auto-kick")
            .setRequired(false)
            .setMinValue(5)
            .setMaxValue(1440),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("messages")
        .setDescription("Configure verification messages")
        .addStringOption((option) =>
          option.setName("welcome").setDescription("Welcome message for new members").setRequired(false),
        )
        .addStringOption((option) =>
          option.setName("verification").setDescription("Verification instructions message").setRequired(false),
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const { supabase } = interaction.client
    const guildId = interaction.guild.id
    const subcommand = interaction.options.getSubcommand()

    try {
      // Get current guild configuration
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

      switch (subcommand) {
        case "view":
          await handleViewConfig(interaction, guildConfig)
          break
        case "autokick":
          await handleAutoKickConfig(interaction, supabase, guildId, guildConfig)
          break
        case "messages":
          await handleMessagesConfig(interaction, supabase, guildId, guildConfig)
          break
      }
    } catch (error) {
      console.error("Config command error:", error)
      await interaction.reply({
        content: "An error occurred while managing configuration.",
        ephemeral: true,
      })
    }
  },
}

async function handleViewConfig(interaction, guildConfig) {
  const verificationChannel = interaction.guild.channels.cache.get(guildConfig.verification_channel_id)
  const verifiedRole = interaction.guild.roles.cache.get(guildConfig.verified_role_id)
  const unverifiedRole = guildConfig.unverified_role_id
    ? interaction.guild.roles.cache.get(guildConfig.unverified_role_id)
    : null

  const embed = new EmbedBuilder()
    .setTitle("⚙️ Verification System Configuration")
    .setDescription(`Current settings for **${interaction.guild.name}**`)
    .addFields(
      {
        name: "📍 Verification Channel",
        value: verificationChannel ? verificationChannel.toString() : "Not found",
        inline: true,
      },
      { name: "🎭 Verified Role", value: verifiedRole ? verifiedRole.toString() : "Not found", inline: true },
      { name: "👤 Unverified Role", value: unverifiedRole ? unverifiedRole.toString() : "None", inline: true },
      {
        name: "🔧 Verification Type",
        value: guildConfig.verification_type.charAt(0).toUpperCase() + guildConfig.verification_type.slice(1),
        inline: true,
      },
      {
        name: "⏰ Auto-Kick",
        value: guildConfig.auto_kick_enabled ? `Enabled (${guildConfig.auto_kick_time} minutes)` : "Disabled",
        inline: true,
      },
      { name: "📝 Welcome Message", value: guildConfig.welcome_message || "Default message", inline: false },
      { name: "🛡️ Verification Message", value: guildConfig.verification_message || "Default message", inline: false },
    )
    .setColor(0x0099ff)
    .setTimestamp()

  await interaction.reply({ embeds: [embed], ephemeral: true })
}

async function handleAutoKickConfig(interaction, supabase, guildId, guildConfig) {
  const enabled = interaction.options.getBoolean("enabled")
  const time = interaction.options.getInteger("time") || guildConfig.auto_kick_time

  const { error: updateError } = await supabase
    .from("guilds")
    .update({
      auto_kick_enabled: enabled,
      auto_kick_time: time,
      updated_at: new Date().toISOString(),
    })
    .eq("id", guildId)

  if (updateError) {
    console.error("Auto-kick config update error:", updateError)
    return interaction.reply({
      content: "Failed to update auto-kick configuration.",
      ephemeral: true,
    })
  }

  const embed = new EmbedBuilder()
    .setTitle("✅ Auto-Kick Configuration Updated")
    .setDescription(`Auto-kick has been ${enabled ? "enabled" : "disabled"}.`)
    .addFields(
      { name: "Status", value: enabled ? "Enabled" : "Disabled", inline: true },
      { name: "Time Limit", value: enabled ? `${time} minutes` : "N/A", inline: true },
    )
    .setColor(enabled ? 0x00ff00 : 0xff0000)
    .setTimestamp()

  await interaction.reply({ embeds: [embed], ephemeral: true })
}

async function handleMessagesConfig(interaction, supabase, guildId, guildConfig) {
  const welcomeMessage = interaction.options.getString("welcome")
  const verificationMessage = interaction.options.getString("verification")

  if (!welcomeMessage && !verificationMessage) {
    return interaction.reply({
      content: "Please provide at least one message to update.",
      ephemeral: true,
    })
  }

  const updateData = { updated_at: new Date().toISOString() }
  if (welcomeMessage) updateData.welcome_message = welcomeMessage
  if (verificationMessage) updateData.verification_message = verificationMessage

  const { error: updateError } = await supabase.from("guilds").update(updateData).eq("id", guildId)

  if (updateError) {
    console.error("Messages config update error:", updateError)
    return interaction.reply({
      content: "Failed to update message configuration.",
      ephemeral: true,
    })
  }

  const embed = new EmbedBuilder()
    .setTitle("✅ Messages Configuration Updated")
    .setDescription("Verification messages have been updated successfully.")
    .setColor(0x00ff00)
    .setTimestamp()

  if (welcomeMessage) {
    embed.addFields({ name: "New Welcome Message", value: welcomeMessage, inline: false })
  }
  if (verificationMessage) {
    embed.addFields({ name: "New Verification Message", value: verificationMessage, inline: false })
  }

  await interaction.reply({ embeds: [embed], ephemeral: true })
}
