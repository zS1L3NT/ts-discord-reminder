import admin from "firebase-admin"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("detail-remove")
		.setDescription("Remove a string of information from a reminder")
		.addStringOption(option =>
			option
				.setName("reminder-id")
				.setDescription("ID of the reminder to edit. Can be found in every reminder")
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName("position")
				.setDescription(
					"The position of the string of information to remove"
				)
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

		const position = helper.integer("position", true)! - 1
		if (position < reminder.value.details.length) {
			const string = reminder.value.details.splice(position, 1)[0]
			await helper.cache
				.getReminderDoc(reminder_id)
				.set({
					details: admin.firestore.FieldValue.arrayRemove(string)
				}, { merge: true })

			helper.respond(new EmbedResponse(
				Emoji.GOOD,
				`Reminder detail removed`
			))
		}
		else {
			helper.respond(new EmbedResponse(
				Emoji.BAD,
				`Detail at index ${position + 1} doesn't exist`
			))
		}
	}
} as iInteractionSubcommandFile