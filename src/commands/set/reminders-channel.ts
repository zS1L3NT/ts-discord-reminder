import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { GuildMember, TextChannel } from "discord.js"

const config = require("../../../config.json")

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("reminders-channel")
		.setDescription(
			"Set the channel that all the reminder embeds show up in"
		)
		.addChannelOption(option =>
			option
				.setName("channel")
				.setDescription("Leave empty to unset the reminders channel")
		),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!member.permissions.has("ADMINISTRATOR") && member.id !== config.discord.dev_id) {
			return helper.respond("❌ Only administrators can set bot channels")
		}

		const channel = helper.channel("channel")
		if (channel instanceof TextChannel) {
			switch (channel.id) {
				case helper.cache.getRemindersChannelId():
					helper.respond(
						"❌ This channel is already the reminders channel!"
					)
					break
				case helper.cache.getPingChannelId():
					helper.respond(
						"❌ This channel is already the ping channel!"
					)
					break
				default:
					await helper.cache.setRemindersChannelId(channel.id)
					helper.cache.updateRemindersChannel().then()
					helper.respond(
						`✅ Reminders channel reassigned to ${channel.toString()}`
					)
					break
			}
		} else if (channel === null) {
			await helper.cache.setRemindersChannelId("")
			helper.respond(`✅ Reminders channel unassigned`)
		} else {
			helper.respond(`❌ Please select a text channel`)
		}
	}
} as iInteractionSubcommandFile
