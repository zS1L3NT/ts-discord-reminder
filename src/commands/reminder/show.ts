import Entry from "../../models/Entry"
import GuildCache from "../../models/GuildCache"
import Reminder from "../../models/Reminder"
import { iInteractionSubcommandFile } from "discordjs-nova"

const file: iInteractionSubcommandFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "show",
		description: {
			slash: "Show the current draft",
			help: "Shows the current draft"
		}
	},
	execute: async helper => {
		helper.respond({
			embeds: [Reminder.getDraftEmbed(helper.cache.draft, helper.cache.guild)]
		})
	}
}

export default file
