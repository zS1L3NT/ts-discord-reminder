import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"
import Reminder from "../../models/Reminder"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

const file: iInteractionSubcommandFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: "Change how much the bot will ping users about a reminder before the due date",
		params: [
			{
				name: "priority",
				description: [
					"Can either be",
					"HIGH  : 7d, 1d, 12h, 2h, 1h, 30m",
					"MEDIUM: 1d, 2h",
					"LOW   : No ping"
				].join("\n"),
				requirements: "Valid Priority",
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
		.setName("priority")
		.setDescription("Change the priority of a reminder")
		.addIntegerOption(option =>
			option
				.setName("priority")
				.setDescription(
					"Can either be HIGH(7d, 1d, 12h, 2h, 1h, 30m), MEDIUM(1d, 2h) or LOW priority"
				)
				.setRequired(true)
				.addChoice("LOW", 0)
				.addChoice("MEDIUM", 1)
				.addChoice("HIGH", 2)
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
		const priority = helper.integer("priority") as 0 | 1 | 2

		if (reminderId) {
			const reminder = helper.cache.reminders.find(
				reminder => reminder.value.id === reminderId
			)
			if (!reminder) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "Reminder doesn't exist"))
			}

			await helper.cache.getReminderDoc(reminderId).set({ priority }, { merge: true })

			helper.respond(new ResponseBuilder(Emoji.GOOD, "Reminder priority updated"))
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "No draft to edit"))
			}

			draft.value.priority = priority
			await helper.cache.getDraftDoc().set({ priority }, { merge: true })

			helper.respond({
				embeds: [
					new ResponseBuilder(Emoji.GOOD, `Draft priority updated`).build(),
					Reminder.getDraftEmbed(draft, helper.cache.guild)
				]
			})
		}
	}
}

export default file
