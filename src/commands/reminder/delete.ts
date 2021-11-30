import admin from "firebase-admin"
import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

const file: iInteractionSubcommandFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: "Deletes a reminder by it's ID which can be copied from every reminder",
		params: [
			{
				name: "reminder-id",
				description: "The ID of the reminder",
				requirements: "Valid Reminder ID",
				required: true
			}
		]
	},
	builder: new SlashCommandSubcommandBuilder()
		.setName("delete")
		.setDescription("Delete a reminder")
		.addStringOption(option =>
			option
				.setName("reminder-id")
				.setDescription("ID of the reminder to edit. Can be found in every reminder")
				.setRequired(true)
		),
	execute: async helper => {
		const reminderId = helper.string("reminder-id")!
		const reminder = helper.cache.reminders.find(reminder => reminder.value.id === reminderId)
		if (!reminder) {
			return helper.respond(new ResponseBuilder(Emoji.BAD, `Reminder does not exist`))
		}

		helper.cache.reminders = helper.cache.reminders.filter(
			reminder => reminder.value.id !== reminderId
		)
		await helper.cache.ref.set(
			{
				// @ts-ignore
				reminders_message_ids: admin.firestore.FieldValue.arrayRemove(
					helper.cache.getRemindersMessageIds()[0]
				)
			},
			{ merge: true }
		)
		await helper.cache.getReminderDoc(reminderId).delete()
		helper.cache.updateRemindersChannel().then()

		helper.respond(new ResponseBuilder(Emoji.GOOD, `Reminder deleted`))
	}
}

export default file
