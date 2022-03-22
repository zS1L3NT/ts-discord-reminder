import Entry from "../../../data/Entry"
import GuildCache from "../../../data/GuildCache"
import { Emoji, iSlashSubFile, ResponseBuilder } from "nova-bot"
import { TextChannel } from "discord.js"

const file: iSlashSubFile<Entry, GuildCache> = {
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
