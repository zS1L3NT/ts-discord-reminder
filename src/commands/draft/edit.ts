import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../app"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("edit")
		.setDescription("Move an assignment to the draft for editing")
		.addStringOption(option =>
			option
				.setName("id")
				.setDescription(
					"ID of the assignment. This is show in each assignment"
				)
				.setRequired(true)
		),
	execute: async helper => {
		if (helper.cache.getDraft()) {
			return helper.respond("❌ Discard existing draft first")
		}

		const id = helper.string("id", true)!
		const assignment = helper.cache.getAssignment(id)

		if (!assignment) {
			return helper.respond(`❌ Assignment does not exist`)
		}

		const draft = await assignment.toDraft(helper.cache)
		await draft.saveToFirestore()
		helper.cache.setDraft(draft)
		await helper.cache.updateNotifyChannelInline()
		await helper.cache.updateModifyChannelInline()

		helper.respond("✅ Assignment moved to draft")
	}
} as iInteractionSubcommandFile
