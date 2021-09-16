import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("title")
		.setDescription("Change the title of a reminder")
		.addStringOption(option =>
			option
				.setName("reminder-id")
				.setDescription("ID of the reminder to edit. Can be found in every reminder")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("title")
				.setDescription("Title of the reminder")
				.setRequired(true)
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

		const title = helper.string("title", true)!
		await helper.cache
			.getReminderDoc(reminder_id)
			.set({
				title
			}, { merge: true })

		helper.respond(new EmbedResponse(
			Emoji.GOOD,
			"Reminder title updated"
		))
	}
} as iInteractionSubcommandFile