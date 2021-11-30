import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import admin from "firebase-admin"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import ResponseBuilder, { Emoji } from "../../utilities/ResponseBuilder"

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
		const reminder_id = helper.string("reminder-id")!
		const reminder = helper.cache.reminders.find(reminder => reminder.value.id === reminder_id)
		if (!reminder) {
			return helper.respond(new ResponseBuilder(Emoji.BAD, `Reminder does not exist`))
		}

		helper.cache.reminders = helper.cache.reminders.filter(
			reminder => reminder.value.id !== reminder_id
		)
		await helper.cache.ref.set(
			{
				reminders_message_ids: admin.firestore.FieldValue.arrayRemove(
					helper.cache.getRemindersMessageIds()[0]
				)
			},
			{ merge: true }
		)
		await helper.cache.getReminderDoc(reminder_id).delete()
		helper.cache.updateRemindersChannel().then()

		helper.respond(new ResponseBuilder(Emoji.GOOD, `Reminder deleted`))
	}
} as iInteractionSubcommandFile
