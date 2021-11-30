import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import Reminder from "../../models/Reminder"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import ResponseBuilder, { Emoji } from "../../utilities/ResponseBuilder"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("create")
		.setDescription("Create a draft of a reminder to make changes to"),
	execute: async helper => {
		const draft = helper.cache.draft
		if (draft) {
			return helper.respond(
				new ResponseBuilder(Emoji.BAD, "Discard the existing draft before creating a new one")
			)
		}

		const reminder = Reminder.getEmpty()
		reminder.value.id = "draft"

		await helper.cache.getDraftDoc().set(reminder.value)
		helper.cache.draft = reminder

		helper.respond({
			embeds: [
				new ResponseBuilder(Emoji.GOOD, `Created draft`).create(),
				Reminder.getDraftEmbed(helper.cache.draft, helper.cache.guild)
			]
		})
	}
} as iInteractionSubcommandFile
