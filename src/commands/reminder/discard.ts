import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

const file: iInteractionSubcommandFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: "Discard a draft reminder if it exists",
		params: []
	},
	builder: new SlashCommandSubcommandBuilder()
		.setName("discard")
		.setDescription("Discard the existing draft"),
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
