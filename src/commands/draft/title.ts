import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import Reminder from "../../models/Reminder"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("title")
		.setDescription("Change the title of the existing draft")
		.addStringOption(option =>
			option
				.setName("title")
				.setDescription("Title of the reminder")
				.setRequired(true)
		),
	execute: async helper => {
		const draft = helper.cache.draft
		if (!draft) {
			return helper.respond(new EmbedResponse(
				Emoji.BAD,
				"No draft to edit"
			))
		}

		const title = helper.string("title", true)!
		draft.value.title = title
		await helper.cache
			.getDraftDoc()
			.set({
				title
			}, { merge: true })

		helper.respond({
			embeds: [
				new EmbedResponse(Emoji.GOOD, "Draft title updated").create(),
				Reminder.getDraftEmbed(draft)
			]
		})
	}
} as iInteractionSubcommandFile
