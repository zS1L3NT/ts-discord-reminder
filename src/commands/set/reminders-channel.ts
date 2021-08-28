import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { TextChannel } from "discord.js"

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
					const message = await channel.send("\u200B")
					await helper.cache.setRemindersChannelId(channel.id)
					await helper.cache.setRemindersMessageId(message.id)
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
