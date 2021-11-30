import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"
import Reminder from "../../models/Reminder"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

const file: iInteractionSubcommandFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: "Change the title of a reminder",
		params: [
			{
				name: "title",
				description: "The title of a reminder",
				requirements: "Text",
				required: true
			},
			{
				name: "reminder-id",
				description: "If this parameter is not given, edits the Draft instead",
				requirements: "Valid Reminder ID",
				required: false,
				default: "Draft ID"
			}
		]
	},
	builder: new SlashCommandSubcommandBuilder()
		.setName("title")
		.setDescription("Change the title of a reminder")
		.addStringOption(option =>
			option.setName("title").setDescription("Title of the reminder").setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("reminder-id")
				.setDescription(
					"ID of the reminder to edit. If not provided, edits the draft instead"
				)
				.setRequired(false)
		),
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
