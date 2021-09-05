import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("priority")
		.setDescription("Change the priority of a reminder")
		.addStringOption(option =>
			option
				.setName("reminder-id")
				.setDescription("ID of the reminder to edit. Can be found in every reminder")
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName("priority")
				.setDescription("Can either be HIGH, MEDIUM or LOW priority")
				.setRequired(true)
				.addChoice("LOW", 0)
				.addChoice("MEDIUM", 1)
				.addChoice("HIGH", 2)
		),
	execute: async helper => {
		const reminder_id = helper.string("reminder-id", true)!
		const reminder = helper.cache.reminders.find(reminder => reminder.value.id === reminder_id)
		if (!reminder) {
			return helper.respond("❌ Reminder doesn't exist")
		}

		const priority = helper.integer("priority", true) as 0 | 1 | 2
		await helper.cache
			.getReminderDoc(reminder_id)
			.set({
				priority
			}, { merge: true })

		helper.respond("✅ Reminder priority updated")
	}
} as iInteractionSubcommandFile