import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("delete")
		.setDescription("Delete a reminder")
		.addStringOption(option =>
			option
				.setName("reminder-id")
				.setDescription("ID of the reminder to edit. Can be found in every reminder")
				.setRequired(true)
		),
	execute: async helper => {
		const reminder_id = helper.string("reminder-id", true)!
		const reminder = helper.cache.reminders
			.find(reminder => reminder.value.id === reminder_id)
		if (!reminder) {
			return helper.respond(`❌ Reminder does not exist`)
		}

		helper.cache.reminders = helper.cache.reminders
			.filter(reminder => reminder.value.id !== reminder_id)
		await helper.cache
			.getReminderDoc(reminder_id)
			.delete()
		helper.cache.updateRemindersChannel().then()

		helper.respond(`✅ Reminder deleted`)
	}
} as iInteractionSubcommandFile
