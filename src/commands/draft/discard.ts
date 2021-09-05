import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("discard")
		.setDescription("Discard the existing draft"),
	execute: async helper => {
		const draft = helper.cache.draft
		if (!draft) {
			return helper.respond("❌ No draft to discard")
		}

		delete helper.cache.draft
		await helper.cache
			.getDraftDoc()
			.delete()

		helper.respond("✅ Draft discarded")
	}
} as iInteractionSubcommandFile
