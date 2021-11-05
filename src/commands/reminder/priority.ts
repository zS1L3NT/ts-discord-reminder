import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import Reminder from "../../models/Reminder"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("priority")
		.setDescription("Change the priority of a reminder")
		.addIntegerOption(option =>
			option
				.setName("priority")
				.setDescription("Can either be HIGH(7d, 24h, 12h, 2h, 1h, 30m), MEDIUM(24h, 2h) or LOW priority")
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
		const reminder_id = helper.string("reminder-id")
		const priority = helper.integer("priority") as 0 | 1 | 2

		if (reminder_id) {
			const reminder = helper.cache.reminders.find(
				reminder => reminder.value.id === reminder_id
			)
			if (!reminder) {
				return helper.respond(new EmbedResponse(Emoji.BAD, "Reminder doesn't exist"))
			}

			await helper.cache.getReminderDoc(reminder_id).set({ priority }, { merge: true })

			helper.respond(new EmbedResponse(Emoji.GOOD, "Reminder priority updated"))
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new EmbedResponse(Emoji.BAD, "No draft to edit"))
			}

			draft.value.priority = priority
			await helper.cache.getDraftDoc().set({ priority }, { merge: true })

			helper.respond({
				embeds: [
					new EmbedResponse(Emoji.GOOD, `Draft priority updated`).create(),
					Reminder.getDraftEmbed(draft)
				]
			})
		}
	}
} as iInteractionSubcommandFile
