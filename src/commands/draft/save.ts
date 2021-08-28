import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("save")
		.setDescription("Save the existing draft to a reminder"),
	execute: async helper => {
		const draft = helper.cache.getDraft()
		if (!draft) {
			return helper.respond("❌ No draft to save")
		}

		if (draft.date < Date.now()) {
			return helper.respond(
				"❌ Existing draft date is invalid, please set it again"
			)
		}

		if (draft.name === "") {
			return helper.respond("❌ Existing draft has no name")
		}

		await helper.cache.pushReminder(draft)
		await helper.cache.removeDraft()
		helper.cache.updateRemindersChannel().then()

		helper.respond("✅ Saved draft")
	}
} as iInteractionSubcommandFile
