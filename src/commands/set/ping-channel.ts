import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { TextChannel } from "discord.js"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("ping-channel")
		.setDescription(
			"Set the channel where the bot pings all users about reminders"
		)
		.addChannelOption(option =>
			option
				.setName("channel")
				.setDescription("Leave empty to unset the pinging channel")
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
					await helper.cache.setPingChannelId(channel.id)
					helper.respond(
						`✅ Pinging channel reassigned to ${channel.toString()}`
					)
					break
			}
		} else if (channel === null) {
			await helper.cache.setPingChannelId("")
			helper.respond(`✅ Pinging channel unassigned`)
		} else {
			helper.respond(`❌ Please select a text channel`)
		}
	}
} as iInteractionSubcommandFile