import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import Reminder from "../../models/Reminder"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("create")
		.setDescription("Create a draft of a reminder to make changes to"),
	execute: async helper => {
		const draft = helper.cache.draft
		if (draft) {
			return helper.respond(
				`❌ Discard the existing draft before creating a new one`
			)
		}

		const reminder = Reminder.getEmpty()
		reminder.value.id = "draft"

		await helper.cache
			.getDraftDoc()
			.set(reminder.value)
		helper.cache.draft = reminder

		helper.respond({
			content: `✅ Created draft`,
			embeds: [Reminder.getDraftEmbed(helper.cache.draft)]
		})
	}
} as iInteractionSubcommandFile
