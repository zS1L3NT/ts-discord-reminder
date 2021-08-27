import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../app"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("subject")
		.setDescription("Change the subject related to the assignment"),
	execute: async helper => {
		const draft = helper.cache.getDraft()
		if (!draft) {
			return helper.respond("❌ No draft to edit")
		}

		const subject = helper.string("subject", true)!
		if (subject in helper.cache.getSubjects()) {
			await draft.setSubject(subject)
			await helper.cache.updateModifyChannelInline()
			helper.respond(`✅ Draft subject updated`)
		} else {
			helper.respond(`❌ ${subject} isn't registered as a subject`)
		}
	}
} as iInteractionSubcommandFile
