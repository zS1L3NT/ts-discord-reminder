import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import ResponseBuilder, { Emoji } from "../../utilities/ResponseBuilder"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("discard")
		.setDescription("Discard the existing draft"),
	execute: async helper => {
		const draft = helper.cache.draft
		if (!draft) {
			return helper.respond(new ResponseBuilder(
				Emoji.BAD,
				"No draft to discard"
			))
		}

		delete helper.cache.draft
		await helper.cache
			.getDraftDoc()
			.delete()

		helper.respond(new ResponseBuilder(
			Emoji.GOOD,
			"Draft discarded"
		))
	}
} as iInteractionSubcommandFile
