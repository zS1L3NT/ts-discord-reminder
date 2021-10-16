import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import admin from "firebase-admin"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("draft-save")
		.setDescription("Save the existing draft to a reminder"),
	execute: async helper => {
		const draft = helper.cache.draft
		if (!draft) {
			return helper.respond(new EmbedResponse(
				Emoji.BAD,
				"No draft to save"
			))
		}

		if (draft.value.due_date < Date.now()) {
			return helper.respond(new EmbedResponse(
				Emoji.BAD,
				"Existing draft due date is invalid, please set it again"
			))
		}

		if (draft.value.title === "") {
			return helper.respond(new EmbedResponse(
				Emoji.BAD,
				"Existing draft has no title"
			))
		}

		const doc = helper.cache.getReminderDoc()
		draft.value.id = doc.id
		await helper.cache.ref
			.set({
				reminders_message_ids: admin.firestore.FieldValue.arrayUnion("")
			}, { merge: true })
		await doc.set(draft.value)
		delete helper.cache.draft
		await helper.cache
			.getDraftDoc()
			.delete()

		helper.respond(new EmbedResponse(
			Emoji.GOOD,
			"Saved draft to reminder"
		))
	}
} as iInteractionSubcommandFile
