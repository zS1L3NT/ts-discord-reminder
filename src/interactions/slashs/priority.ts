import { Emoji, iSlashSubFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import Reminder from "../../data/Reminder"

const file: iSlashSubFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "priority",
		description: {
			slash: "Change the priority of a Reminder",
			help: "Change how much the bot will ping users about a Reminder before the due date"
		},
		options: [
			{
				name: "priority",
				description: {
					slash: "Can either be HIGH(7d, 1d, 12h, 2h, 1h, 30m), MEDIUM(1d, 2h) or LOW priority",
					help: [
						"Can either be",
						"HIGH  : 7d, 1d, 12h, 2h, 1h, 30m",
						"MEDIUM: 1d, 2h",
						"LOW   : No ping"
					].join("\n")
				},
				type: "number",
				requirements: "Valid Priority",
				required: true,
				choices: [
					{
						name: "LOW",
						value: 0
					},
					{
						name: "MEDIUM",
						value: 1
					},
					{
						name: "HIGH",
						value: 2
					}
				]
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
		const priority = helper.integer("priority") as 0 | 1 | 2

		if (reminderId) {
			const reminder = helper.cache.reminders.find(reminder => reminder.id === reminderId)
			if (!reminder) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "Reminder doesn't exist"))
			}

			await helper.cache.getReminderDoc(reminderId).update({ priority })

			helper.respond(new ResponseBuilder(Emoji.GOOD, "Reminder priority updated"))
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "No draft to edit"))
			}

			draft.priority = priority
			await helper.cache.getDraftDoc().update({ priority })

			helper.respond({
				embeds: [
					new ResponseBuilder(Emoji.GOOD, `Draft priority updated`).build(),
					Reminder.toDraftMessageEmbed(draft, helper.cache.guild)
				]
			})
		}
	}
}

export default file
