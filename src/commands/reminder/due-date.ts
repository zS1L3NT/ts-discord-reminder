import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import DateHelper from "../../utilities/DateHelper"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("due-date")
		.setDescription("Change the due date of a reminder. Leave empty to unset due date")
		.addStringOption(option =>
			option
				.setName("reminder-id")
				.setDescription("ID of the reminder to edit. Can be found in every reminder")
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName("day")
				.setDescription("Day of the month from 1 - 31")
				.setRequired(false)
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
			option
				.setName("year")
				.setDescription("Year")
				.setRequired(false)
		)
		.addIntegerOption(option =>
			option
				.setName("hour")
				.setDescription("Hour in 24h format from 0 - 23")
				.setRequired(false)
		)
		.addIntegerOption(option =>
			option
				.setName("minute")
				.setDescription("Minute")
				.setRequired(false)
		),
	execute: async helper => {
		const reminder_id = helper.string("reminder-id", true)!
		const reminder = helper.cache.reminders.find(reminder => reminder.value.id === reminder_id)
		if (!reminder) {
			return helper.respond(new EmbedResponse(
				Emoji.BAD,
				"Reminder doesn't exist"
			))
		}

		const day = helper.integer("day")
		const month = helper.integer("month")
		const year = helper.integer("year")
		const hour = helper.integer("hour")
		const minute = helper.integer("minute")

		let due_date: number
		if (!day && !month && !year && !hour && !minute) {
			return helper.respond(new EmbedResponse(
				Emoji.BAD,
				"Update at least one field in the date"
			))
		}
		else {
			const date = new Date(reminder.value.due_date)
			try {
				due_date = DateHelper.verify(
					day ?? date.getDate(),
					month ?? date.getMonth(),
					year ?? date.getFullYear(),
					hour ?? date.getHours(),
					minute ?? date.getMinutes()
				).getTime()
			} catch (err) {
				return helper.respond(new EmbedResponse(
					Emoji.BAD,
					`${err.message}`
				))
			}
		}

		await helper.cache
			.getReminderDoc(reminder_id)
			.set({
				due_date
			}, { merge: true })

		helper.respond(new EmbedResponse(
			Emoji.GOOD,
			"Reminder due date updated"
		))
	}
} as iInteractionSubcommandFile