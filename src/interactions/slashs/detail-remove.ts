import admin from "firebase-admin"
import { Emoji, iSlashSubFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import Reminder from "../../data/Reminder"

const file: iSlashSubFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "detail-remove",
		description: {
			slash: "Remove a string of information from a Reminder",
			help: "Removes a line of detail from a Reminder"
		},
		options: [
			{
				name: "position",
				description: {
					slash: "The position of the string of information to remove",
					help: "The line number of the detail to remove"
				},
				type: "number",
				requirements: "Number that references a line number of a detail",
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
		const position = helper.integer("position")! - 1

		if (reminderId) {
			const reminder = helper.cache.reminders.find(reminder => reminder.id === reminderId)
			if (!reminder) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "Reminder doesn't exist"))
			}

			if (position < reminder.details.length) {
				const string = reminder.details.splice(position, 1)[0]
				await helper.cache
					.getReminderDoc(reminderId)
					.set(
						{ details: admin.firestore.FieldValue.arrayRemove(string) },
						{ merge: true }
					)

				helper.respond(new ResponseBuilder(Emoji.GOOD, `Reminder detail removed`))
			} else {
				helper.respond(
					new ResponseBuilder(Emoji.BAD, `Detail at index ${position + 1} doesn't exist`)
				)
			}
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "No draft to edit"))
			}

			if (position < draft.details.length) {
				const string = draft.details.splice(position, 1)[0]
				await helper.cache
					.getDraftDoc()
					.set(
						{ details: admin.firestore.FieldValue.arrayRemove(string) },
						{ merge: true }
					)

				helper.respond({
					embeds: [
						new ResponseBuilder(Emoji.GOOD, `Draft detail removed`).build(),
						Reminder.toDraftMessageEmbed(draft, helper.cache.guild)
					]
				})
			} else {
				helper.respond(
					new ResponseBuilder(Emoji.BAD, `Detail at index ${position + 1} doesn't exist`)
				)
			}
		}
	}
}

export default file
