import { Emoji, iSlashSubFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import Reminder from "../../data/Reminder"

const file: iSlashSubFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "create",
		description: {
			slash: "Create a draft of a Reminder to make changes to",
			help: "Creates a draft for a Reminder that you should make changes to"
		}
	},
	execute: async helper => {
		const draft = helper.cache.draft
		if (draft) {
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"Discard the existing draft before creating a new one"
				)
			)
		}

		const reminder = Reminder.getEmpty()
		reminder.id = "draft"

		await helper.cache.getDraftDoc().set(reminder)
		helper.cache.draft = reminder

		helper.respond({
			embeds: [
				new ResponseBuilder(Emoji.GOOD, `Created draft`).build(),
				Reminder.toDraftMessageEmbed(helper.cache.draft, helper.cache.guild)
			]
		})
	}
}

export default file
