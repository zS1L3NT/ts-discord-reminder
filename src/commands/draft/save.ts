import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("save")
		.setDescription("Save the existing draft to a reminder"),
	execute: async helper => {
		const draft = helper.cache.draft
		if (!draft) {
			return helper.respond("❌ No draft to save")
		}

		if (draft.value.due_date < Date.now()) {
			return helper.respond(
				"❌ Existing draft date is invalid, please set it again"
			)
		}

		if (draft.value.title === "") {
			return helper.respond("❌ Existing draft has no name")
		}

		const doc = helper.cache.getReminderDoc()
		draft.value.id = doc.id
		await doc.set(draft.value)
		delete helper.cache.draft
		await helper.cache
			.getDraftDoc()
			.delete()

		helper.respond("✅ Saved draft to reminder")
	}
} as iInteractionSubcommandFile
