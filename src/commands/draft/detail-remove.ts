import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../app"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("detail-remove")
		.setDescription(
			"Remove a string of information from the existing draft"
		)
		.addIntegerOption(option =>
			option
				.setName("position")
				.setDescription(
					"The position of the string of information to remove"
				)
				.setRequired(true)
		),
	execute: async helper => {
		const draft = helper.cache.getDraft()
		if (!draft) {
			return helper.respond("❌ No draft to edit")
		}

		const position = helper.integer("position", true)! - 1
		if (position < helper.cache.getDraft()!.getDetails().length) {
			await draft.removeDetail(position)
			await helper.cache.updateModifyChannelInline()

			helper.respond(`✅ Detail removed from draft`)
		} else {
			helper.respond(`❌ Detail at index ${position + 1} doesn't exist`)
		}
	}
} as iInteractionSubcommandFile
