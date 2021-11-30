import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { DateTime } from "luxon"
import { useTry } from "no-try"
import Reminder from "../../models/Reminder"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import DateHelper from "../../utilities/DateHelper"
import ResponseBuilder, { Emoji } from "../../utilities/ResponseBuilder"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
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
		const reminder_id = helper.string("reminder-id")
		const day = helper.integer("day")
		const month = helper.integer("month")
		const year = helper.integer("year")
		const hour = helper.integer("hour")
		const minute = helper.integer("minute")

		if (reminder_id) {
			const reminder = helper.cache.reminders.find(
				reminder => reminder.value.id === reminder_id
			)
			if (!reminder) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "Reminder doesn't exist"))
			}

			if (!day && !month && !year && !hour && !minute) {
				return helper.respond(
					new ResponseBuilder(Emoji.BAD, "Update at least one field in the date")
				)
			}

			const [err, due_date] = useTry(() => {
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

			await helper.cache.getReminderDoc(reminder_id).set({ due_date }, { merge: true })

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

			const [err, due_date] = useTry(() => {
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

			draft.value.due_date = due_date
			await helper.cache.getDraftDoc().set({ due_date }, { merge: true })

			helper.respond({
				embeds: [
					new ResponseBuilder(Emoji.GOOD, `Draft due date updated`).create(),
					Reminder.getDraftEmbed(draft, helper.cache.guild)
				]
			})
		}
	}
} as iInteractionSubcommandFile
