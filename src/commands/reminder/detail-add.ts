import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import admin from "firebase-admin"
import Reminder from "../../models/Reminder"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import ResponseBuilder, { Emoji } from "../../utilities/ResponseBuilder"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("detail-add")
		.setDescription("Add a string of information to a reminder/draft")
		.addStringOption(option =>
			option
				.setName("detail")
				.setDescription("The string of information to add")
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
		const detail = helper.string("detail")!

		if (reminder_id) {
			const reminder = helper.cache.reminders.find(
				reminder => reminder.value.id === reminder_id
			)
			if (!reminder) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "Reminder doesn't exist"))
			}

			await helper.cache
				.getReminderDoc(reminder_id)
				.set({ details: admin.firestore.FieldValue.arrayUnion(detail) }, { merge: true })

			helper.respond(new ResponseBuilder(Emoji.GOOD, `Reminder detail added`))
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "No draft to edit"))
			}

			draft.value.details.push(detail)
			await helper.cache
				.getDraftDoc()
				.set({ details: admin.firestore.FieldValue.arrayUnion(detail) }, { merge: true })

			helper.respond({
				embeds: [
					new ResponseBuilder(Emoji.GOOD, `Draft detail added`).create(),
					Reminder.getDraftEmbed(draft, helper.cache.guild)
				]
			})
		}
	}
} as iInteractionSubcommandFile
