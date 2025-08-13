const {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js")
const { createClient } = require("@supabase/supabase-js")
const express = require("express")

class VerificationBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    })

    // Initialize Supabase with service role key for full access
    this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    this.client.commands = new Collection()
    this.setupEventHandlers()
    this.loadCommands()
    this.setupHealthServer()
    this.startVerificationQueueProcessor()
  }

  setupHealthServer() {
    const app = express()
    const port = process.env.PORT || 3000

    app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        uptime: process.uptime(),
        guilds: this.client.guilds.cache.size,
        timestamp: new Date().toISOString(),
      })
    })

    app.listen(port, () => {
      console.log(`Health server running on port ${port}`)
    })
  }

  async loadCommands() {
    // Define commands directly in the bot
    const commands = [
      {
        data: new SlashCommandBuilder()
          .setName("setup")
          .setDescription("Setup verification system for this server")
          .addChannelOption((option) =>
            option.setName("channel").setDescription("Channel to send verification embed").setRequired(true),
          )
          .addRoleOption((option) =>
            option.setName("role").setDescription("Role to give verified members").setRequired(true),
          )
          .addStringOption((option) =>
            option
              .setName("method")
              .setDescription("Verification method")
              .setRequired(true)
              .addChoices(
                { name: "Button Click", value: "button" },
                { name: "Code Challenge", value: "code" },
                { name: "Website Verification", value: "website" },
              ),
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        execute: async (interaction, supabase) => {
          const channel = interaction.options.getChannel("channel")
          const role = interaction.options.getRole("role")
          const method = interaction.options.getString("method")

          // Save guild configuration
          await supabase.from("guild_configs").upsert({
            guild_id: interaction.guild.id,
            verification_method: method,
            verified_role_id: role.id,
            verification_channel_id: channel.id,
            welcome_message: "Welcome! Please verify to access the server.",
            success_message: "You have been successfully verified!",
            auto_kick_enabled: true,
            auto_kick_time: 10,
          })

          // Create verification embed
          const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("🛡️ Server Verification")
            .setDescription(
              "Welcome to the server! To gain access to all channels, please complete the verification process below.\n\n" +
                "**Why verify?**\n" +
                "• Helps keep the server safe from bots and spam\n" +
                "• Ensures you're a real person\n" +
                "• Gives you access to all server features\n\n" +
                "Click the button below to start verification!",
            )
            .addFields(
              { name: "⏱️ Time Limit", value: "10 minutes", inline: true },
              { name: "🔒 Method", value: method.charAt(0).toUpperCase() + method.slice(1), inline: true },
              { name: "🎯 Role", value: `<@&${role.id}>`, inline: true },
            )
            .setFooter({ text: "Verification system powered by VerifyBot" })
            .setTimestamp()

          const button = new ButtonBuilder()
            .setCustomId("verify_button")
            .setLabel("🛡️ Start Verification")
            .setStyle(ButtonStyle.Primary)

          const row = new ActionRowBuilder().addComponents(button)

          await channel.send({ embeds: [embed], components: [row] })

          await interaction.reply({
            content: `✅ Verification system setup complete!\n**Channel:** ${channel}\n**Role:** ${role}\n**Method:** ${method}`,
            ephemeral: true,
          })
        },
      },
      {
        data: new SlashCommandBuilder()
          .setName("verify")
          .setDescription("Manually verify a user")
          .addUserOption((option) => option.setName("user").setDescription("User to verify").setRequired(true))
          .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        execute: async (interaction, supabase) => {
          const user = interaction.options.getUser("user")
          const member = await interaction.guild.members.fetch(user.id)
          const guildConfig = await this.getGuildConfig(interaction.guild.id)

          if (guildConfig.verified_role_id) {
            await member.roles.add(guildConfig.verified_role_id)
          }

          // Log verification
          await supabase.from("verification_logs").insert({
            user_id: user.id,
            guild_id: interaction.guild.id,
            username: user.username,
            verification_method: "manual",
            status: "verified",
            verified_by: interaction.user.id,
          })

          await interaction.reply({
            content: `✅ Successfully verified ${user.username}!`,
            ephemeral: true,
          })
        },
      },
      {
        data: new SlashCommandBuilder()
          .setName("unverify")
          .setDescription("Remove verification from a user")
          .addUserOption((option) => option.setName("user").setDescription("User to unverify").setRequired(true))
          .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        execute: async (interaction, supabase) => {
          const user = interaction.options.getUser("user")
          const member = await interaction.guild.members.fetch(user.id)
          const guildConfig = await this.getGuildConfig(interaction.guild.id)

          if (guildConfig.verified_role_id) {
            await member.roles.remove(guildConfig.verified_role_id)
          }

          // Log unverification
          await supabase.from("verification_logs").insert({
            user_id: user.id,
            guild_id: interaction.guild.id,
            username: user.username,
            verification_method: "manual",
            status: "unverified",
            verified_by: interaction.user.id,
          })

          await interaction.reply({
            content: `✅ Successfully unverified ${user.username}!`,
            ephemeral: true,
          })
        },
      },
      {
        data: new SlashCommandBuilder()
          .setName("stats")
          .setDescription("View verification statistics for this server")
          .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        execute: async (interaction, supabase) => {
          const guildId = interaction.guild.id

          // Get verification stats
          const { data: totalVerifications } = await supabase
            .from("verification_logs")
            .select("*", { count: "exact" })
            .eq("guild_id", guildId)
            .eq("status", "verified")

          const { data: recentVerifications } = await supabase
            .from("verification_logs")
            .select("*", { count: "exact" })
            .eq("guild_id", guildId)
            .eq("status", "verified")
            .gte("verified_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

          const { data: pendingVerifications } = await supabase
            .from("pending_verifications")
            .select("*", { count: "exact" })
            .eq("guild_id", guildId)

          const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("📊 Verification Statistics")
            .addFields(
              { name: "Total Verified", value: totalVerifications?.length?.toString() || "0", inline: true },
              { name: "Last 24 Hours", value: recentVerifications?.length?.toString() || "0", inline: true },
              { name: "Pending", value: pendingVerifications?.length?.toString() || "0", inline: true },
            )
            .setTimestamp()

          await interaction.reply({ embeds: [embed], ephemeral: true })
        },
      },
      {
        data: new SlashCommandBuilder()
          .setName("config")
          .setDescription("Configure verification settings")
          .addBooleanOption((option) =>
            option.setName("autokick").setDescription("Enable auto-kick for unverified users"),
          )
          .addIntegerOption((option) =>
            option.setName("kicktime").setDescription("Minutes before auto-kick (1-60)").setMinValue(1).setMaxValue(60),
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        execute: async (interaction, supabase) => {
          const autoKick = interaction.options.getBoolean("autokick")
          const kickTime = interaction.options.getInteger("kicktime")

          const updates = {}
          if (autoKick !== null) updates.auto_kick_enabled = autoKick
          if (kickTime !== null) updates.auto_kick_time = kickTime

          if (Object.keys(updates).length === 0) {
            return interaction.reply({ content: "❌ Please specify at least one setting to update!", ephemeral: true })
          }

          await supabase.from("guild_configs").upsert({
            guild_id: interaction.guild.id,
            ...updates,
          })

          let response = "✅ Configuration updated:\n"
          if (autoKick !== null) response += `• Auto-kick: ${autoKick ? "Enabled" : "Disabled"}\n`
          if (kickTime !== null) response += `• Kick time: ${kickTime} minutes\n`

          await interaction.reply({ content: response, ephemeral: true })
        },
      },
    ]

    // Register commands
    for (const command of commands) {
      this.client.commands.set(command.data.name, command)
    }
  }

  setupEventHandlers() {
    this.client.once("ready", async () => {
      console.log(`✅ Bot is ready! Logged in as ${this.client.user.tag}`)
      this.client.user.setActivity("Verifying members", { type: 3 }) // WATCHING type

      // Register slash commands globally
      try {
        const commands = Array.from(this.client.commands.values()).map((cmd) => cmd.data.toJSON())
        await this.client.application.commands.set(commands)
        console.log("✅ Slash commands registered globally")
      } catch (error) {
        console.error("Error registering commands:", error)
      }
    })

    this.client.on("interactionCreate", async (interaction) => {
      if (interaction.isChatInputCommand()) {
        await this.handleSlashCommand(interaction)
      } else if (interaction.isButton()) {
        await this.handleButtonInteraction(interaction)
      } else if (interaction.isModalSubmit()) {
        await this.handleModalSubmit(interaction)
      }
    })

    this.client.on("guildMemberAdd", async (member) => {
      await this.handleNewMember(member)
    })
  }

  async handleSlashCommand(interaction) {
    const command = this.client.commands.get(interaction.commandName)
    if (!command) return

    try {
      await command.execute(interaction, this.supabase)
    } catch (error) {
      console.error("Error executing command:", error)
      const reply = { content: "There was an error executing this command!", ephemeral: true }

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply)
      } else {
        await interaction.reply(reply)
      }
    }
  }

  async handleButtonInteraction(interaction) {
    if (interaction.customId === "verify_button") {
      await this.startVerification(interaction)
    }
  }

  async handleModalSubmit(interaction) {
    if (interaction.customId === "verification_modal") {
      await this.processVerification(interaction)
    }
  }

  async startVerification(interaction) {
    const guildConfig = await this.getGuildConfig(interaction.guild.id)

    if (guildConfig.verification_method === "button") {
      await this.verifyMember(interaction.member, interaction)
    } else if (guildConfig.verification_method === "website") {
      await this.startWebsiteVerification(interaction)
    } else {
      await this.showCodeModal(interaction)
    }
  }

  async startWebsiteVerification(interaction) {
    // Store pending verification
    await this.supabase.from("pending_verifications").upsert({
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
      username: interaction.user.username,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    })

    const verificationUrl = `${process.env.WEBSITE_URL}/verify?guild=${interaction.guild.id}&user=${interaction.user.id}`

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("🌐 Website Verification Required")
      .setDescription(
        "Please complete verification on our website:\n\n" +
          `**[Click here to verify](${verificationUrl})**\n\n` +
          "⏱️ You have 10 minutes to complete verification.\n" +
          "🔒 This link is unique to you and expires after use.",
      )
      .setFooter({ text: "Close this message after clicking the link" })

    await interaction.reply({ embeds: [embed], ephemeral: true })
  }

  async showCodeModal(interaction) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store verification code in database
    await this.supabase.from("pending_verifications").upsert({
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
      username: interaction.user.username,
      verification_code: code,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })

    const modal = new ModalBuilder().setCustomId("verification_modal").setTitle("Member Verification")

    const codeInput = new TextInputBuilder()
      .setCustomId("verification_code")
      .setLabel(`Enter this code: ${code}`)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(6)

    modal.addComponents(new ActionRowBuilder().addComponents(codeInput))
    await interaction.showModal(modal)
  }

  async processVerification(interaction) {
    const submittedCode = interaction.fields.getTextInputValue("verification_code")

    const { data: verification } = await this.supabase
      .from("pending_verifications")
      .select("*")
      .eq("user_id", interaction.user.id)
      .eq("guild_id", interaction.guild.id)
      .single()

    if (!verification || verification.verification_code !== submittedCode) {
      return interaction.reply({ content: "❌ Invalid verification code!", ephemeral: true })
    }

    if (new Date(verification.expires_at) < new Date()) {
      return interaction.reply({ content: "❌ Verification code expired!", ephemeral: true })
    }

    await this.verifyMember(interaction.member, interaction)

    // Clean up verification record
    await this.supabase
      .from("pending_verifications")
      .delete()
      .eq("user_id", interaction.user.id)
      .eq("guild_id", interaction.guild.id)
  }

  async verifyMember(member, interaction) {
    const guildConfig = await this.getGuildConfig(member.guild.id)

    try {
      if (guildConfig.verified_role_id) {
        await member.roles.add(guildConfig.verified_role_id)
      }

      // Log verification
      await this.supabase.from("verification_logs").insert({
        user_id: member.id,
        guild_id: member.guild.id,
        username: member.user.username,
        verification_method: guildConfig.verification_method,
        status: "verified",
      })

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("✅ Verification Successful!")
        .setDescription(guildConfig.success_message || "You have been successfully verified!")
        .setTimestamp()

      await interaction.reply({ embeds: [embed], ephemeral: true })
    } catch (error) {
      console.error("Error verifying member:", error)
      await interaction.reply({ content: "❌ Error during verification process!", ephemeral: true })
    }
  }

  startVerificationQueueProcessor() {
    setInterval(async () => {
      try {
        const { data: queueItems } = await this.supabase
          .from("verification_queue")
          .select("*")
          .eq("processed", false)
          .order("created_at", { ascending: true })
          .limit(10)

        for (const item of queueItems || []) {
          try {
            const guild = this.client.guilds.cache.get(item.guild_id)
            if (!guild) continue

            const member = await guild.members.fetch(item.user_id)
            if (!member) continue

            if (item.action === "verify") {
              const guildConfig = await this.getGuildConfig(item.guild_id)
              if (guildConfig.verified_role_id) {
                await member.roles.add(guildConfig.verified_role_id)
              }
            }

            // Mark as processed
            await this.supabase.from("verification_queue").update({ processed: true }).eq("id", item.id)
          } catch (error) {
            console.error(`Error processing queue item ${item.id}:`, error)
            // Mark as processed to avoid infinite retries
            await this.supabase.from("verification_queue").update({ processed: true }).eq("id", item.id)
          }
        }
      } catch (error) {
        console.error("Error in verification queue processor:", error)
      }
    }, 5000) // Check every 5 seconds
  }

  async handleNewMember(member) {
    const guildConfig = await this.getGuildConfig(member.guild.id)

    if (!guildConfig.auto_kick_enabled) return

    // Set auto-kick timer
    setTimeout(
      async () => {
        try {
          const updatedMember = await member.guild.members.fetch(member.id)
          const hasVerifiedRole =
            guildConfig.verified_role_id && updatedMember.roles.cache.has(guildConfig.verified_role_id)

          if (!hasVerifiedRole) {
            await updatedMember.kick("Failed to verify within time limit")

            // Log auto-kick
            await this.supabase.from("verification_logs").insert({
              user_id: member.id,
              guild_id: member.guild.id,
              username: member.user.username,
              verification_method: "auto_kick",
              status: "kicked",
            })
          }
        } catch (error) {
          console.error("Error in auto-kick:", error)
        }
      },
      guildConfig.auto_kick_time * 60 * 1000,
    )
  }

  async getGuildConfig(guildId) {
    const { data: config } = await this.supabase.from("guild_configs").select("*").eq("guild_id", guildId).single()

    return (
      config || {
        guild_id: guildId,
        verification_method: "button",
        verified_role_id: null,
        verification_channel_id: null,
        welcome_message: "Welcome! Please verify to access the server.",
        success_message: "You have been successfully verified!",
        auto_kick_enabled: false,
        auto_kick_time: 10,
      }
    )
  }

  async start() {
    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN)
    } catch (error) {
      console.error("Failed to start bot:", error)
      process.exit(1)
    }
  }
}

// Start the bot
const bot = new VerificationBot()
bot.start()

module.exports = VerificationBot
