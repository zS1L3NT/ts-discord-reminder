import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../app"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("name")
		.setDescription("Change the name of the existing draft")
		.addStringOption(option =>
			option
				.setName("name")
				.setDescription("Name of the assignment")
				.setRequired(true)
		),
	execute: async helper => {
		const draft = helper.cache.getDraft()
		if (!draft) {
			return helper.respond("❌ No draft to edit")
		}

		const name = helper.string("name", true)!
		await draft.setName(name)
		await helper.cache.updateModifyChannelInline()

		helper.respond("✅ Draft name updated")
	}
} as iInteractionSubcommandFile
