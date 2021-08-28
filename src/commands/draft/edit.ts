import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { Draft } from "../../models/Reminder"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("edit")
		.setDescription("Move an reminder to the draft for editing")
		.addStringOption(option =>
			option
				.setName("id")
				.setDescription(
					"ID of the reminder. This is show in each reminder"
				)
				.setRequired(true)
		),
	execute: async helper => {
		if (helper.cache.getDraft()) {
			return helper.respond("❌ Discard existing draft first")
		}

		const id = helper.string("id", true)!
		const reminder = helper.cache.getReminder(id)

		if (!reminder) {
			return helper.respond(`❌ Reminder does not exist`)
		}

		const draft = await reminder.toDraft(helper.cache)
		await draft.saveToFirestore()
		helper.cache.setDraft(draft)
		helper.cache.updateRemindersChannel().then()

		helper.respond({
			content: "✅ Reminder moved to draft",
			embeds: [Draft.getFormatted(draft)]
		})
	}
} as iInteractionSubcommandFile
