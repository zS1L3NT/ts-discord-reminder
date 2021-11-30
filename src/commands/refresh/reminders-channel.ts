import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { TextChannel } from "discord.js"

const file: iInteractionSubcommandFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: "Manually refresh the reminders channel if it has been set",
		params: []
	},
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
}

export default file
