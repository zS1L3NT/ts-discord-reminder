import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { Draft } from "../../models/Reminder"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("name")
		.setDescription("Change the name of the existing draft")
		.addStringOption(option =>
			option
				.setName("name")
				.setDescription("Name of the reminder")
				.setRequired(true)
		),
	execute: async helper => {
		const draft = helper.cache.getDraft()
		if (!draft) {
			return helper.respond("❌ No draft to edit")
		}

		const name = helper.string("name", true)!
		await draft.setName(name)

		helper.respond({
			content: "✅ Draft name updated",
			embeds: [Draft.getFormatted(draft)]
		})
	}
} as iInteractionSubcommandFile
