import Entry from "../../../data/Entry"
import GuildCache from "../../../data/GuildCache"
import Reminder from "../../../data/Reminder"
import { iSlashSubFile } from "nova-bot"

const file: iSlashSubFile<Entry, GuildCache> = {
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
