import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import admin from "firebase-admin"
import Reminder from "../../models/Reminder"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("detail-remove")
		.setDescription("Remove a string of information from a reminder/draft")
		.addIntegerOption(option =>
			option
				.setName("position")
				.setDescription("The position of the string of information to remove")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("reminder-id")
				.setDescription(
					"ID of the reminder to edit. If not provided, edits the draft instead"
				)
				.setRequired(false)
		),
	execute: async helper => {
		const reminder_id = helper.string("reminder-id")
		const position = helper.integer("position")! - 1

		if (reminder_id) {
			const reminder = helper.cache.reminders.find(
				reminder => reminder.value.id === reminder_id
			)
			if (!reminder) {
				return helper.respond(new EmbedResponse(Emoji.BAD, "Reminder doesn't exist"))
			}

			if (position < reminder.value.details.length) {
				const string = reminder.value.details.splice(position, 1)[0]
				await helper.cache
					.getReminderDoc(reminder_id)
					.set(
						{ details: admin.firestore.FieldValue.arrayRemove(string) },
						{ merge: true }
					)

				helper.respond(new EmbedResponse(Emoji.GOOD, `Reminder detail removed`))
			} else {
				helper.respond(
					new EmbedResponse(Emoji.BAD, `Detail at index ${position + 1} doesn't exist`)
				)
			}
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new EmbedResponse(Emoji.BAD, "No draft to edit"))
			}

			if (position < draft.value.details.length) {
				const string = draft.value.details.splice(position, 1)[0]
				await helper.cache
					.getDraftDoc()
					.set(
						{ details: admin.firestore.FieldValue.arrayRemove(string) },
						{ merge: true }
					)

				helper.respond({
					embeds: [
						new EmbedResponse(Emoji.GOOD, `Draft detail removed`).create(),
						Reminder.getDraftEmbed(draft)
					]
				})
			} else {
				helper.respond(
					new EmbedResponse(Emoji.BAD, `Detail at index ${position + 1} doesn't exist`)
				)
			}
		}
	}
} as iInteractionSubcommandFile
