import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { TextChannel } from "discord.js"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("reminders-channel")
		.setDescription("Refresh reminders in the reminders channel"),
	execute: async helper => {
		const channel = await helper.cache.guild.channels.fetch(
			helper.cache.getRemindersChannelId()
		)
		if (channel instanceof TextChannel) {
			await helper.cache.updateRemindersChannel()
			helper.respond(new EmbedResponse(Emoji.GOOD, "Reminders channel refreshed"))
		} else {
			helper.respond(new EmbedResponse(Emoji.BAD, "No reminders channel set"))
		}
	}
} as iInteractionSubcommandFile
