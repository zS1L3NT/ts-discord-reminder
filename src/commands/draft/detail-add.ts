import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../app"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("detail-add")
		.setDescription("Add a string of information to the existing draft")
		.addStringOption(option =>
			option
				.setName("detail")
				.setDescription("The string of information to add")
				.setRequired(true)
		),
	execute: async helper => {
		const draft = helper.cache.getDraft()
		if (!draft) {
			return helper.respond("❌ No draft to edit")
		}

		const detail = helper.string("detail", true)!
		await draft.pushDetail(detail)
		await helper.cache.updateModifyChannelInline()

		helper.respond(`✅ Detail added to draft`)
	}
} as iInteractionSubcommandFile
