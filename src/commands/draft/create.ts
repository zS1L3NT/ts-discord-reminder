import { iInteractionSubcommandFile } from "../../app"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import Draft from "../../models/Draft"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("create")
		.setDescription("Create a draft of an assignment to make changes to"),
	execute: async helper => {
		const draft = helper.cache.getDraft()
		if (draft) {
			return helper.respond(
				`❌ Discard the existing draft before creating a new one`
			)
		}

		const assignment = new Draft(
			helper.cache,
			helper.cache.generateAssignmentId(),
			"",
			"",
			new Date().getTime(),
			[]
		)
		await assignment.saveToFirestore()
		helper.cache.setDraft(assignment)
		await helper.cache.updateModifyChannelInline()

		helper.respond({
			content: `✅ Created draft`,
			embeds: [Draft.getFormatted(draft)]
		})
	}
} as iInteractionSubcommandFile
