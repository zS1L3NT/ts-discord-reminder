import Entry from "../../models/Entry"
import GuildCache from "../../models/GuildCache"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { TextChannel } from "discord.js"

const file: iInteractionSubcommandFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "reminders-channel",
		description: {
			slash: "Refresh Reminders in the Reminders channel",
			help: "Manually refresh the Reminders channel if it has been set"
		}
	},
	execute: async helper => {
		const channel = await helper.cache.guild.channels.fetch(
			helper.cache.getRemindersChannelId()
		)
		if (channel instanceof TextChannel) {
			await helper.cache.updateRemindersChannel()
			helper.respond(new ResponseBuilder(Emoji.GOOD, "Reminders channel refreshed"))
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, "No Reminders channel set"))
		}
	}
}

export default file
