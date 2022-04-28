import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import Reminder from "../../data/Reminder"
import { Emoji, iSlashSubFile, ResponseBuilder } from "nova-bot"

const file: iSlashSubFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "title",
		description: {
			slash: "Change the title of a Reminder",
			help: "Change the title of a Reminder"
		},
		options: [
			{
				name: "title",
				description: {
					slash: "Title of a Reminder",
					help: "The title of a Reminder"
				},
				type: "string",
				requirements: "Text",
				required: true
			},
			{
				name: "reminder-id",
				description: {
					slash: "ID of the Reminder",
					help: [
						"This is the ID of the Reminder to edit",
						"Each Reminder ID can be found in the Reminder itself in the Reminders channel"
					].join("\n")
				},
				type: "string",
				requirements: "Valid Reminder ID",
				required: false,
				default: "Draft ID"
			}
		]
	},
	execute: async helper => {
		const reminderId = helper.string("reminder-id")
		const title = helper.string("title")!

		if (reminderId) {
			const reminder = helper.cache.reminders.find(
				reminder => reminder.value.id === reminderId
			)
			if (!reminder) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "Reminder doesn't exist"))
			}

			await helper.cache.getReminderDoc(reminderId).set({ title }, { merge: true })

			helper.respond(new ResponseBuilder(Emoji.GOOD, "Reminder title updated"))
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "No draft to edit"))
			}

			draft.value.title = title
			await helper.cache.getDraftDoc().set({ title }, { merge: true })

			helper.respond({
				embeds: [
					new ResponseBuilder(Emoji.GOOD, "Draft title updated").build(),
					Reminder.getDraftEmbed(draft, helper.cache.guild)
				]
			})
		}
	}
}

export default file
