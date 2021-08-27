import { iInteractionSubcommandFile } from "../../app"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("discard")
		.setDescription("Discard the existing draft"),
	execute: async helper => {
		const draft = helper.cache.getDraft()
		if (!draft) {
			return helper.respond("❌ No draft to discard")
		}

		await helper.cache.removeDraft()
		await helper.cache.updateModifyChannelInline()

		helper.respond("✅ Draft discarded")
	}
} as iInteractionSubcommandFile
