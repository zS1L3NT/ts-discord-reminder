import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import DateHelper from "../../utilities/DateHelper"
import Reminder from "../../models/Reminder"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("due-date")
		.setDescription("Set the due date of the existing draft")
		.addIntegerOption(option =>
			option
				.setName("day")
				.setDescription("Day of the month from 1 - 31")
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName("month")
				.setDescription("Month")
				.setRequired(true)
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
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName("hour")
				.setDescription("Hour in 24h format from 0 - 23")
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName("minute")
				.setDescription("Minute")
				.setRequired(true)
		),
	execute: async helper => {
		const draft = helper.cache.draft
		if (!draft) {
			return helper.respond("❌ No draft to edit")
		}

		const day = helper.integer("day", true)!
		const month = helper.integer("month", true)!
		const year = helper.integer("year", true)!
		const hour = helper.integer("hour", true)!
		const minute = helper.integer("minute", true)!

		let due_date: number
		try {
			due_date = DateHelper.verify(day, month, year, hour, minute).getTime()
		} catch (err) {
			return helper.respond(`❌ ${err}`)
		}

		draft.value.due_date = due_date
		await helper.cache
			.getDraftDoc()
			.set({
				due_date
			}, { merge: true })

		helper.respond({
			content: `✅ Draft due date updated`,
			embeds: [Reminder.getDraftEmbed(draft)]
		})
	}
} as iInteractionSubcommandFile
