import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../app"
import { TextChannel } from "discord.js"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("assignments-channel")
		.setDescription(
			"Set the channel that all the assignment embeds show up in"
		)
		.addChannelOption(option =>
			option
				.setName("channel")
				.setDescription("Leave empty to unset the assignments channel")
		),
	execute: async helper => {
		const channel = helper.channel("channel")
		if (channel instanceof TextChannel) {
			switch (channel.id) {
				case helper.cache.getNotifyChannelId():
					helper.respond(
						"❌ This channel is already the notify channel!"
					)
					break
				case helper.cache.getModifyChannelId():
					helper.respond(
						"❌ This channel is already the modify channel!"
					)
					break
				case helper.cache.getPingChannelId():
					helper.respond(
						"❌ This channel is already the ping channel!"
					)
					break
				default:
					await helper.cache.setNotifyChannelId(channel.id)
					helper.respond(
						`✅ Assignments channel reassigned to ${channel.toString()}`
					)
					break
			}
		} else if (channel === null) {
			await helper.cache.setNotifyChannelId("")
			helper.respond(`✅ Assignments channel unassigned`)
		} else {
			helper.respond(`❌ Please select a text channel`)
		}
	}
} as iInteractionSubcommandFile
