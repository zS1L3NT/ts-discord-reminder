import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { TextChannel } from "discord.js"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"

module.exports = {
	builder: new SlashCommandSubcommandBuilder()
		.setName("reminders-channel")
		.setDescription("Refresh reminders in the reminders channel"),
	execute: async helper => {
		const channel = await helper.cache.guild.channels.fetch(
			helper.cache.getRemindersChannelId()
		)
		if (channel instanceof TextChannel) {
			await helper.cache.updateRemindersChannel()
			helper.respond(new ResponseBuilder(Emoji.GOOD, "Reminders channel refreshed"))
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, "No reminders channel set"))
		}
	}
} as iInteractionSubcommandFile<iValue, Document, GuildCache>
