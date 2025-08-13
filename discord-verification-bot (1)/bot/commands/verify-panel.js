const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify-panel")
    .setDescription("Create a verification panel")
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Channel to send the panel (optional)").setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, supabase) {
    const channel = interaction.options.getChannel("channel") || interaction.channel
    const guildId = interaction.guild.id

    // Get guild config
    const { data: config } = await supabase.from("guild_configs").select("*").eq("guild_id", guildId).single()

    const welcomeMessage = config?.welcome_message || "Welcome! Please verify to access the server."
    const verificationMethod = config?.verification_method || "button"

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("🛡️ Server Verification")
      .setDescription(welcomeMessage)
      .addFields(
        {
          name: "📋 Instructions",
          value: "Click the button below to verify your account and gain access to the server.",
        },
        { name: "⏱️ Note", value: "Verification is required to participate in this server." },
      )
      .setFooter({ text: "Verification System" })
      .setTimestamp()

    const button = new ButtonBuilder()
      .setCustomId(verificationMethod === "button" ? "verify_button" : "verify_code")
      .setLabel(verificationMethod === "button" ? "✅ Verify Me" : "🔢 Get Code")
      .setStyle(ButtonStyle.Success)

    const row = new ActionRowBuilder().addComponents(button)

    try {
      await channel.send({ embeds: [embed], components: [row] })
      await interaction.reply({
        content: `✅ Verification panel created in ${channel}!`,
        ephemeral: true,
      })
    } catch (error) {
      console.error("Error creating verification panel:", error)
      await interaction.reply({
        content: "❌ Failed to create verification panel!",
        ephemeral: true,
      })
    }
  },
}
