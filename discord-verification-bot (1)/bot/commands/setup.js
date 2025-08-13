const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Configure the verification system")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("channel")
        .setDescription("Set the verification channel")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel for verification")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("role")
        .setDescription("Set the verified role")
        .addRoleOption((option) =>
          option.setName("role").setDescription("The role to give verified members").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("method")
        .setDescription("Set verification method")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Verification method")
            .setRequired(true)
            .addChoices({ name: "Button Click", value: "button" }, { name: "Code Challenge", value: "code" }),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("autokick")
        .setDescription("Configure auto-kick for unverified members")
        .addBooleanOption((option) => option.setName("enabled").setDescription("Enable auto-kick").setRequired(true))
        .addIntegerOption((option) =>
          option.setName("minutes").setDescription("Minutes before auto-kick (1-60)").setMinValue(1).setMaxValue(60),
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, supabase) {
    const subcommand = interaction.options.getSubcommand()
    const guildId = interaction.guild.id

    // Get current config
    let { data: config } = await supabase.from("guild_configs").select("*").eq("guild_id", guildId).single()

    if (!config) {
      config = {
        guild_id: guildId,
        verification_method: "button",
        verified_role_id: null,
        verification_channel_id: null,
        welcome_message: "Welcome! Please verify to access the server.",
        success_message: "You have been successfully verified!",
        auto_kick_enabled: false,
        auto_kick_time: 10,
      }
    }

    switch (subcommand) {
      case "channel":
        const channel = interaction.options.getChannel("channel")
        config.verification_channel_id = channel.id

        await supabase.from("guild_configs").upsert(config)

        await interaction.reply({
          content: `✅ Verification channel set to ${channel}`,
          ephemeral: true,
        })
        break

      case "role":
        const role = interaction.options.getRole("role")
        config.verified_role_id = role.id

        await supabase.from("guild_configs").upsert(config)

        await interaction.reply({
          content: `✅ Verified role set to ${role}`,
          ephemeral: true,
        })
        break

      case "method":
        const method = interaction.options.getString("type")
        config.verification_method = method

        await supabase.from("guild_configs").upsert(config)

        await interaction.reply({
          content: `✅ Verification method set to ${method === "button" ? "Button Click" : "Code Challenge"}`,
          ephemeral: true,
        })
        break

      case "autokick":
        const enabled = interaction.options.getBoolean("enabled")
        const minutes = interaction.options.getInteger("minutes") || 10

        config.auto_kick_enabled = enabled
        config.auto_kick_time = minutes

        await supabase.from("guild_configs").upsert(config)

        await interaction.reply({
          content: `✅ Auto-kick ${enabled ? `enabled (${minutes} minutes)` : "disabled"}`,
          ephemeral: true,
        })
        break
    }
  },
}
