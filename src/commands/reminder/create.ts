import Entry from "../../models/Entry"
import GuildCache from "../../models/GuildCache"
import Reminder from "../../models/Reminder"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"

const file: iInteractionSubcommandFile<Entry, GuildCache> = {
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
		reminder.value.id = "draft"

		await helper.cache.getDraftDoc().set(reminder.value)
		helper.cache.draft = reminder

		helper.respond({
			embeds: [
				new ResponseBuilder(Emoji.GOOD, `Created draft`).build(),
				Reminder.getDraftEmbed(helper.cache.draft, helper.cache.guild)
			]
		})
	}
}

export default file
