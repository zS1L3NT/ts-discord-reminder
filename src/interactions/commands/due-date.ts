import { DateTime } from "luxon"
import { useTry } from "no-try"
import { BaseCommand, CommandHelper, DateHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import Reminder from "../../data/Reminder"
import ReminderOrDraftMiddleware from "../../middleware/ReminderOrDraftMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Change the due date of a Reminder",
		options: [
			{
				name: "reminder-id",
				description: "This is the ID of the Reminder to edit",
				type: "string" as const,
				requirements: "Valid Reminder ID",
				required: false,
				default: "Draft ID"
			},
			{
				name: "day",
				description: "Day of the month for the Reminder",
				type: "number" as const,
				requirements: "Number between 1 ~ 30 or 31, depending on the `month`",
				required: false,
				default: "Current value in the Reminder"
			},
			{
				name: "month",
				description: "Month of the year for the Reminder",
				type: "number" as const,
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
				description: "Year for the Reminder",
				type: "number" as const,
				requirements: "Number that isn't more than 5 years more than the current year",
				required: false,
				default: "Current value in the Reminder"
			},
			{
				name: "hour",
				description: "Hour of the day for the Reminder",
				type: "number" as const,
				requirements: "Number between 0 ~ 23",
				required: false,
				default: "Current value in the Reminder"
			},
			{
				name: "minute",
				description: "Minute of the hour for the Reminder",
				type: "number" as const,
				requirements: "Number between 0 ~ 59",
				required: false,
				default: "Current value in the Reminder"
			}
		]
	}

	override middleware = [new ReminderOrDraftMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(true)
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {
		const args = helper.args()
		return {
			"reminder-id": args.at(0)?.match(/^[A-Za-z0-9]{20}$/)
				? args.shift() && args.at(0)
				: null,
			day:
				args.at(0) === undefined
					? null
					: (args.shift(), isNaN(+args.at(0)!) ? null : +args.at(0)!),
			month:
				args.at(0) === undefined
					? null
					: (args.shift(), isNaN(+args.at(0)!) ? null : +args.at(0)! - 1),
			year:
				args.at(0) === undefined
					? null
					: (args.shift(), isNaN(+args.at(0)!) ? null : +args.at(0)!),
			hour:
				args.at(0) === undefined
					? null
					: (args.shift(), isNaN(+args.at(0)!) ? null : +args.at(0)!),
			minute:
				args.at(0) === undefined
					? null
					: (args.shift(), isNaN(+args.at(0)!) ? null : +args.at(0)!)
		}
	}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const reminderId = helper.string("reminder-id")
		const day = helper.integer("day")
		const month = helper.integer("month")
		const year = helper.integer("year")
		const hour = helper.integer("hour")
		const minute = helper.integer("minute")

		if (reminderId) {
			const reminder = helper.cache.reminders.find(reminder => reminder.id === reminderId)!

			if (!day && !month && !year && !hour && !minute) {
				return helper.respond(ResponseBuilder.bad("Update at least one field in the date"))
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
				return helper.respond(ResponseBuilder.bad(err.message))
			}

			await helper.cache.getReminderDoc(reminderId).update({ due_date: dueDate })

			helper.respond(ResponseBuilder.good("Reminder due date updated"))
		} else {
			const draft = helper.cache.draft!

			if (!day && !month && !year && !hour && !minute) {
				return helper.respond(ResponseBuilder.bad("Update at least one field in the date"))
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
				return helper.respond(ResponseBuilder.bad(err.message))
			}

			draft.due_date = dueDate
			await helper.cache.getDraftDoc().update({ due_date: dueDate })

			helper.respond({
				embeds: [
					ResponseBuilder.good(`Draft due date updated`).build(),
					Reminder.toDraftMessageEmbed(draft, helper.cache.guild)
				]
			})
		}
	}
}
