import admin from "firebase-admin"
import { Emoji, iSlashSubFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import Reminder from "../../data/Reminder"

const file: iSlashSubFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "detail-add",
		description: {
			slash: "Add a string of information to a Reminder",
			help: "Adds a detail to a Reminder"
		},
		options: [
			{
				name: "detail",
				description: {
					slash: "The string of information to add",
					help: "Line of text to add to the description of a Reminder"
				},
				type: "string",
				requirements: "Text",
				required: true
			},
			{
				name: "reminder-id",
				description: {
					slash: "ID of the Reminder",
					help: [
						"This is the ID of the Reminder to edit",
						"Each Reminder ID can be found in the Reminder itself in the Reminders channel"
					].join("\n")
				},
				type: "string",
				requirements: "Valid Reminder ID",
				required: false,
				default: "Draft ID"
			}
		]
	},
	execute: async helper => {
		const reminderId = helper.string("reminder-id")
		const detail = helper.string("detail")!

		if (reminderId) {
			const reminder = helper.cache.reminders.find(reminder => reminder.id === reminderId)
			if (!reminder) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "Reminder doesn't exist"))
			}

			await helper.cache
				.getReminderDoc(reminderId)
				.set({ details: admin.firestore.FieldValue.arrayUnion(detail) }, { merge: true })

			helper.respond(new ResponseBuilder(Emoji.GOOD, `Reminder detail added`))
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "No draft to edit"))
			}

			draft.details.push(detail)
			await helper.cache
				.getDraftDoc()
				.set({ details: admin.firestore.FieldValue.arrayUnion(detail) }, { merge: true })

			helper.respond({
				embeds: [
					new ResponseBuilder(Emoji.GOOD, `Draft detail added`).build(),
					Reminder.toDraftMessageEmbed(draft, helper.cache.guild)
				]
			})
		}
	}
}

export default file
