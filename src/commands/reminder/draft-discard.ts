import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("draft-discard")
		.setDescription("Discard the existing draft"),
	execute: async helper => {
		const draft = helper.cache.draft
		if (!draft) {
			return helper.respond(new EmbedResponse(
				Emoji.BAD,
				"No draft to discard"
			))
		}

		delete helper.cache.draft
		await helper.cache
			.getDraftDoc()
			.delete()

		helper.respond(new EmbedResponse(
			Emoji.GOOD,
			"Draft discarded"
		))
	}
} as iInteractionSubcommandFile
