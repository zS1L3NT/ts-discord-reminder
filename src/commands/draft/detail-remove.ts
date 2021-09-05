import admin from "firebase-admin"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import Reminder from "../../models/Reminder"

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
		const draft = helper.cache.draft
		if (!draft) {
			return helper.respond("❌ No draft to edit")
		}

		const position = helper.integer("position", true)! - 1
		if (position < draft.value.details.length) {
			const string = draft.value.details.splice(position, 1)[0]
			await helper.cache
				.getDraftDoc()
				.set({
					details: admin.firestore.FieldValue.arrayRemove(string)
				}, { merge: true })

			helper.respond({
				content: `✅ Draft detail removed`,
				embeds: [Reminder.getDraftEmbed(draft)]
			})
		}
		else {
			helper.respond(`❌ Detail at index ${position + 1} doesn't exist`)
		}
	}
} as iInteractionSubcommandFile
