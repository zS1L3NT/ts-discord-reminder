import admin from "firebase-admin"
import { Emoji, iSlashSubFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

const file: iSlashSubFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "delete",
		description: {
			slash: "Delete a Reminder",
			help: "Deletes a Reminder by it's ID which can be copied from every Reminder"
		},
		options: [
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
				required: true
			}
		]
	},
	execute: async helper => {
		const reminderId = helper.string("reminder-id")!
		const reminder = helper.cache.reminders.find(reminder => reminder.id === reminderId)
		if (!reminder) {
			return helper.respond(new ResponseBuilder(Emoji.BAD, `Reminder does not exist`))
		}

		helper.cache.reminders = helper.cache.reminders.filter(
			reminder => reminder.id !== reminderId
		)
		await helper.cache.ref.set(
			{
				// @ts-ignore
				reminder_message_ids: admin.firestore.FieldValue.arrayRemove(
					helper.cache.getReminderMessageIds()[0]
				)
			},
			{ merge: true }
		)
		await helper.cache.getReminderDoc(reminderId).delete()
		helper.cache.updateRemindersChannel()

		helper.respond(new ResponseBuilder(Emoji.GOOD, `Reminder deleted`))
	}
}

export default file
