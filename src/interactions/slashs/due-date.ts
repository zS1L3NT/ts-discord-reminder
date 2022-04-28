import { DateTime } from "luxon"
import { useTry } from "no-try"
import { DateHelper, Emoji, iSlashSubFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import Reminder from "../../data/Reminder"

const file: iSlashSubFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "due-date",
		description: {
			slash: "Change the due date of a Reminder",
			help: [
				"Change the due date of a Reminder",
				"You can change specific parts of the due date"
			].join("\n")
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
				required: false,
				default: "Draft ID"
			},
			{
				name: "day",
				description: {
					slash: "Day",
					help: "Day of the month for the Reminder"
				},
				type: "number",
				requirements: "Number between 1 ~ 30 or 31, depending on the `month`",
				required: false,
				default: "Current value in the Reminder"
			},
			{
				name: "month",
				description: {
					slash: "Month",
					help: "Month of the year for the Reminder"
				},
				type: "number",
				requirements: "Month",
				required: false,
				default: "Current value in the Reminder",
				choices: DateHelper.nameOfMonths.map(name => ({
					name,
					value: DateHelper.nameOfMonths.indexOf(name)
				}))
			},
			{
				name: "year",
				description: {
					slash: "Year",
					help: "Year for the Reminder"
				},
				type: "number",
				requirements: "Number that isn't more than 5 years more than the current year",
				required: false,
				default: "Current value in the Reminder"
			},
			{
				name: "hour",
				description: {
					slash: "Hour",
					help: "Hour of the day for the Reminder"
				},
				type: "number",
				requirements: "Number between 0 ~ 23",
				required: false,
				default: "Current value in the Reminder"
			},
			{
				name: "minute",
				description: {
					slash: "Minute",
					help: "Minute of the hour for the Reminder"
				},
				type: "number",
				requirements: "Number between 0 ~ 59",
				required: false,
				default: "Current value in the Reminder"
			}
		]
	},
	execute: async helper => {
		const reminderId = helper.string("reminder-id")
		const day = helper.integer("day")
		const month = helper.integer("month")
		const year = helper.integer("year")
		const hour = helper.integer("hour")
		const minute = helper.integer("minute")

		if (reminderId) {
			const reminder = helper.cache.reminders.find(reminder => reminder.id === reminderId)
			if (!reminder) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "Reminder doesn't exist"))
			}

			if (!day && !month && !year && !hour && !minute) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, "Update at least one field in the date")
				)
			}

			const [err, dueDate] = useTry(() => {
				const date = DateTime.fromMillis(reminder.due_date).setZone("Asia/Singapore")
				return DateHelper.verify(
					day ?? date.day,
					month ?? date.month - 1,
					year ?? date.year,
					hour ?? date.hour,
					minute ?? date.minute
				).toMillis()
			})

			if (err) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, `${err.message}`))
			}

			await helper.cache
				.getReminderDoc(reminderId)
				.set({ due_date: dueDate }, { merge: true })

			helper.respond(new ResponseBuilder(Emoji.GOOD, "Reminder due date updated"))
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "No draft to edit"))
			}

			if (!day && !month && !year && !hour && !minute) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, "Update at least one field in the date")
				)
			}

			const [err, dueDate] = useTry(() => {
				const date = DateTime.fromMillis(draft.due_date).setZone("Asia/Singapore")
				return DateHelper.verify(
					day ?? date.day,
					month ?? date.month - 1,
					year ?? date.year,
					hour ?? date.hour,
					minute ?? date.minute
				).toMillis()
			})

			if (err) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, `${err.message}`))
			}

			draft.due_date = dueDate
			await helper.cache.getDraftDoc().set({ due_date: dueDate }, { merge: true })

			helper.respond({
				embeds: [
					new ResponseBuilder(Emoji.GOOD, `Draft due date updated`).build(),
					Reminder.toDraftMessageEmbed(draft, helper.cache.guild)
				]
			})
		}
	}
}

export default file
