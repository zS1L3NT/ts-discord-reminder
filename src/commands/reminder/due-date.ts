import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"
import Reminder from "../../models/Reminder"
import { DateHelper, Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { DateTime } from "luxon"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { useTry } from "no-try"

const file: iInteractionSubcommandFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: "Change the due date of a reminder",
		params: [
			{
				name: "reminder-id",
				description: "If this parameter is not given, edits the Draft instead",
				requirements: "Valid Reminder ID",
				required: false,
				default: "Draft ID"
			},
			{
				name: "day",
				description: "Day of the month for the reminder",
				requirements: "Number between 1 ~ 30 or 31, depending on the `month`",
				required: false,
				default: "Current value in the reminder"
			},
			{
				name: "month",
				description: "Month of the year for the reminder",
				requirements: "Month",
				required: false,
				default: "Current value in the reminder"
			},
			{
				name: "year",
				description: "Year for the reminder",
				requirements: "Number that isn't more than 5 years more than the current year",
				required: false,
				default: "Current value in the reminder"
			},
			{
				name: "hour",
				description: "Hour of the day for the reminder",
				requirements: "Number between 0 ~ 23",
				required: false,
				default: "Current value in the reminder"
			},
			{
				name: "minute",
				description: "Minute of the hour for the reminder",
				requirements: "Number between 0 ~ 59",
				required: false,
				default: "Current value in the reminder"
			}
		]
	},
	builder: new SlashCommandSubcommandBuilder()
		.setName("due-date")
		.setDescription("Change the due date of a reminder. Leave empty to unset due date")
		.addStringOption(option =>
			option
				.setName("reminder-id")
				.setDescription(
					"ID of the reminder to edit. If not provided, edits the draft instead"
				)
				.setRequired(false)
		)
		.addIntegerOption(option =>
			option.setName("day").setDescription("Day of the month from 1 - 31").setRequired(false)
		)
		.addIntegerOption(option =>
			option
				.setName("month")
				.setDescription("Month")
				.setRequired(false)
				.addChoices(
					DateHelper.name_of_months.map(name => [
						name,
						DateHelper.name_of_months.indexOf(name)
					])
				)
		)
		.addIntegerOption(option =>
			option.setName("year").setDescription("Year").setRequired(false)
		)
		.addIntegerOption(option =>
			option
				.setName("hour")
				.setDescription("Hour in 24h format from 0 - 23")
				.setRequired(false)
		)
		.addIntegerOption(option =>
			option.setName("minute").setDescription("Minute").setRequired(false)
		),
	execute: async helper => {
		const reminderId = helper.string("reminder-id")
		const day = helper.integer("day")
		const month = helper.integer("month")
		const year = helper.integer("year")
		const hour = helper.integer("hour")
		const minute = helper.integer("minute")

		if (reminderId) {
			const reminder = helper.cache.reminders.find(
				reminder => reminder.value.id === reminderId
			)
			if (!reminder) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "Reminder doesn't exist"))
			}

			if (!day && !month && !year && !hour && !minute) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, "Update at least one field in the date")
				)
			}

			const [err, dueDate] = useTry(() => {
				const date = DateTime.fromMillis(reminder.value.due_date).setZone("Asia/Singapore")
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
				const date = DateTime.fromMillis(draft.value.due_date).setZone("Asia/Singapore")
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

			draft.value.due_date = dueDate
			await helper.cache.getDraftDoc().set({ due_date: dueDate }, { merge: true })

			helper.respond({
				embeds: [
					new ResponseBuilder(Emoji.GOOD, `Draft due date updated`).build(),
					Reminder.getDraftEmbed(draft, helper.cache.guild)
				]
			})
		}
	}
}

export default file
