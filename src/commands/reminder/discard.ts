import Entry from "../../models/Entry"
import GuildCache from "../../models/GuildCache"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"

const file: iInteractionSubcommandFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "discard",
		description: {
			slash: "Discard the existing draft",
			help: "Discard a draft Reminder if it exists"
		}
	},
	execute: async helper => {
		const draft = helper.cache.draft
		if (!draft) {
			return helper.respond(new ResponseBuilder(Emoji.BAD, "No draft to discard"))
		}

		delete helper.cache.draft
		await helper.cache.getDraftDoc().delete()

		helper.respond(new ResponseBuilder(Emoji.GOOD, "Draft discarded"))
	}
}

export default file
