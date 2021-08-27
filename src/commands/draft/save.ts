import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../app"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("save")
		.setDescription("Save the existing"),
	execute: async helper => {
		const draft = helper.cache.getDraft()
		if (!draft) {
			return helper.respond("❌ No draft to save")
		}

		if (draft.getDate() < new Date().getTime()) {
			return helper.respond(
				"❌ Existing draft date is invalid, please set it again"
			)
		}

		if (draft.getName() === "") {
			return helper.respond("❌ Existing draft has no name")
		}

		if (draft.getSubject() === "") {
			return helper.respond("❌ Existing draft has no subject")
		}

		await helper.cache.pushAssignment(draft)
		await helper.cache.removeDraft()
		await helper.cache.updateNotifyChannelInline()
		await helper.cache.updateModifyChannelInline()

		helper.respond("✅ Saved draft")
	}
} as iInteractionSubcommandFile
