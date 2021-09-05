import admin from "firebase-admin"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import Reminder from "../../models/Reminder"

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
		const draft = helper.cache.draft
		if (!draft) {
			return helper.respond("❌ No draft to edit")
		}

		const detail = helper.string("detail", true)!
		draft.value.details.push(detail)
		await helper.cache
			.getDraftDoc()
			.set({
				details: admin.firestore.FieldValue.arrayUnion(detail)
			}, { merge: true })

		helper.respond({
			content: `✅ Draft detail added`,
			embeds: [Reminder.getDraftEmbed(draft)]
		})
	}
} as iInteractionSubcommandFile
