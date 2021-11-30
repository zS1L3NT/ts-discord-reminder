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
		description: "Removes a line of detail from a reminder",
		params: [
			{
				name: "position",
				description: "The line number of the detail to remove",
				requirements: "Number that references a line number of a detail",
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
		.setName("detail-remove")
		.setDescription("Remove a string of information from a reminder/draft")
		.addIntegerOption(option =>
			option
				.setName("position")
				.setDescription("The position of the string of information to remove")
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
		const position = helper.integer("position")! - 1

		if (reminderId) {
			const reminder = helper.cache.reminders.find(
				reminder => reminder.value.id === reminderId
			)
			if (!reminder) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "Reminder doesn't exist"))
			}

			if (position < reminder.value.details.length) {
				const string = reminder.value.details.splice(position, 1)[0]
				await helper.cache
					.getReminderDoc(reminderId)
					.set(
						{ details: admin.firestore.FieldValue.arrayRemove(string) },
						{ merge: true }
					)

				helper.respond(new ResponseBuilder(Emoji.GOOD, `Reminder detail removed`))
			} else {
				helper.respond(
					new ResponseBuilder(Emoji.BAD, `Detail at index ${position + 1} doesn't exist`)
				)
			}
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "No draft to edit"))
			}

			if (position < draft.value.details.length) {
				const string = draft.value.details.splice(position, 1)[0]
				await helper.cache
					.getDraftDoc()
					.set(
						{ details: admin.firestore.FieldValue.arrayRemove(string) },
						{ merge: true }
					)

				helper.respond({
					embeds: [
						new ResponseBuilder(Emoji.GOOD, `Draft detail removed`).build(),
						Reminder.getDraftEmbed(draft, helper.cache.guild)
					]
				})
			} else {
				helper.respond(
					new ResponseBuilder(Emoji.BAD, `Detail at index ${position + 1} doesn't exist`)
				)
			}
		}
	}
}

export default file
