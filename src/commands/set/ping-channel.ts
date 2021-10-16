import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { GuildMember, TextChannel } from "discord.js"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

const config = require("../../../config.json")

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("ping-channel")
		.setDescription("Set the channel where the bot pings all users about reminders")
		.addChannelOption(option =>
			option.setName("channel").setDescription("Leave empty to unset the pinging channel")
		),
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!member.permissions.has("ADMINISTRATOR") && member.id !== config.discord.dev_id) {
			return helper.respond(
				new EmbedResponse(Emoji.BAD, "Only administrators can set bot channels")
			)
		}

		const channel = helper.channel("channel")
		if (channel instanceof TextChannel) {
			switch (channel.id) {
				case helper.cache.getRemindersChannelId():
					helper.respond(
						new EmbedResponse(
							Emoji.BAD,
							"This channel is already the reminders channel!"
						)
					)
					break
				case helper.cache.getPingChannelId():
					helper.respond(
						new EmbedResponse(Emoji.BAD, "This channel is already the ping channel!")
					)
					break
				default:
					await helper.cache.setPingChannelId(channel.id)
					helper.respond(
						new EmbedResponse(
							Emoji.GOOD,
							`Pinging channel reassigned to ${channel.toString()}`
						)
					)
					break
			}
		} else if (channel === null) {
			await helper.cache.setPingChannelId("")
			helper.respond(new EmbedResponse(Emoji.GOOD, `Pinging channel unassigned`))
		} else {
			helper.respond(new EmbedResponse(Emoji.BAD, `Please select a text channel`))
		}
	}
} as iInteractionSubcommandFile
