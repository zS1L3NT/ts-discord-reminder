import admin from "firebase-admin"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("detail-add")
		.setDescription("Add a string of information to a reminder")
		.addStringOption(option =>
			option
				.setName("reminder-id")
				.setDescription("ID of the reminder to edit. Can be found in every reminder")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("detail")
				.setDescription("The string of information to add")
				.setRequired(true)
		),
	execute: async helper => {
		const reminder_id = helper.string("reminder-id", true)!
		const reminder = helper.cache.reminders.find(reminder => reminder.value.id === reminder_id)
		if (!reminder) {
			return helper.respond("❌ Reminder doesn't exist")
		}

		const detail = helper.string("detail", true)!
		await helper.cache
			.getReminderDoc(reminder_id)
			.set({
				details: admin.firestore.FieldValue.arrayUnion(detail)
			}, { merge: true })

		helper.respond(`✅ Reminder detail added`)
	}
} as iInteractionSubcommandFile