import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { Draft } from "../../models/Reminder"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("create")
		.setDescription("Create a draft of a reminder to make changes to"),
	execute: async helper => {
		const draft = helper.cache.getDraft()
		if (draft) {
			return helper.respond(
				`❌ Discard the existing draft before creating a new one`
			)
		}

		const reminder = new Draft(
			helper.cache,
			helper.cache.generateReminderId(),
			"",
			Date.now(),
			[],
			1
		)
		await reminder.saveToFirestore()
		helper.cache.setDraft(reminder)

		helper.respond({
			content: `✅ Created draft`,
			embeds: [Draft.getFormatted(helper.cache.getDraft())]
		})
	}
} as iInteractionSubcommandFile
