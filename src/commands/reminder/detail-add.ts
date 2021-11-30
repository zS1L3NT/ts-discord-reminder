import admin from "firebase-admin"
import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"
import Reminder from "../../models/Reminder"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

const file: iInteractionSubcommandFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: "Adds a detail to a reminder",
		params: [
			{
				name: "detail",
				description: "Line of text to add to the description of a reminder",
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
		.setName("detail-add")
		.setDescription("Add a string of information to a reminder/draft")
		.addStringOption(option =>
			option
				.setName("detail")
				.setDescription("The string of information to add")
				.setRequired(true)
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
		const detail = helper.string("detail")!

		if (reminderId) {
			const reminder = helper.cache.reminders.find(
				reminder => reminder.value.id === reminderId
			)
			if (!reminder) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "Reminder doesn't exist"))
			}

			await helper.cache
				.getReminderDoc(reminderId)
				.set({ details: admin.firestore.FieldValue.arrayUnion(detail) }, { merge: true })

			helper.respond(new ResponseBuilder(Emoji.GOOD, `Reminder detail added`))
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "No draft to edit"))
			}

			draft.value.details.push(detail)
			await helper.cache
				.getDraftDoc()
				.set({ details: admin.firestore.FieldValue.arrayUnion(detail) }, { merge: true })

			helper.respond({
				embeds: [
					new ResponseBuilder(Emoji.GOOD, `Draft detail added`).build(),
					Reminder.getDraftEmbed(draft, helper.cache.guild)
				]
			})
		}
	}
}

export default file
