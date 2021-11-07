import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import Reminder from "../../models/Reminder"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
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
		const reminder_id = helper.string("reminder-id")
		const title = helper.string("title")!

		if (reminder_id) {
			const reminder = helper.cache.reminders.find(
				reminder => reminder.value.id === reminder_id
			)
			if (!reminder) {
				return helper.respond(new EmbedResponse(Emoji.BAD, "Reminder doesn't exist"))
			}

			await helper.cache.getReminderDoc(reminder_id).set({ title }, { merge: true })

			helper.respond(new EmbedResponse(Emoji.GOOD, "Reminder title updated"))
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new EmbedResponse(Emoji.BAD, "No draft to edit"))
			}

			draft.value.title = title
			await helper.cache.getDraftDoc().set({ title }, { merge: true })

			helper.respond({
				embeds: [
					new EmbedResponse(Emoji.GOOD, "Draft title updated").create(),
					Reminder.getDraftEmbed(draft, helper.cache.guild)
				]
			})
		}
	}
} as iInteractionSubcommandFile
