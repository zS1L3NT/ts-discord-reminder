import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { Draft } from "../../models/Reminder"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("priority")
		.setDescription("Change the priority of the reminder")
		.addIntegerOption(option =>
			option
				.setName("priority")
				.setDescription("Can either be HIGH or LOW priority")
				.setRequired(true)
				.addChoice("HIGH", 2)
				.addChoice("LOW", 1)
		),
	execute: async helper => {
		const draft = helper.cache.getDraft()
		if (!draft) {
			return helper.respond("❌ No draft to edit")
		}

		const priority = helper.integer("priority", true) as 1 | 2
		await draft.setPriority(priority)

		helper.respond({
			content: "✅ Draft priority updated",
			embeds: [Draft.getFormatted(draft)]
		})
	}
} as iInteractionSubcommandFile
