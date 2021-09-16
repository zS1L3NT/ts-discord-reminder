import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import Reminder from "../../models/Reminder"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("priority")
		.setDescription("Change the priority of the reminder")
		.addIntegerOption(option =>
			option
				.setName("priority")
				.setDescription("Can either be HIGH, MEDIUM or LOW priority")
				.setRequired(true)
				.addChoice("LOW", 0)
				.addChoice("MEDIUM", 1)
				.addChoice("HIGH", 2)
		),
	execute: async helper => {
		const draft = helper.cache.draft
		if (!draft) {
			return helper.respond(new EmbedResponse(
				Emoji.BAD,
				"No draft to edit"
			))
		}

		const priority = helper.integer("priority", true) as 0 | 1 | 2
		draft.value.priority = priority
		await helper.cache
			.getDraftDoc()
			.set({
				priority
			}, { merge: true })

		helper.respond({
			embeds: [
				new EmbedResponse(Emoji.GOOD, `Draft priority updated`).create(),
				Reminder.getDraftEmbed(draft)
			]
		})
	}
} as iInteractionSubcommandFile
