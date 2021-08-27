import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../app"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("delete")
		.setDescription("Delete a subject which has no assignments bound to it")
		.addStringOption(option =>
			option
				.setName("subject")
				.setDescription(
					"The string identifier for the subject. Keep this short"
				)
				.setRequired(true)
		),
	execute: async helper => {
		const subject = helper.string("subject", true)!

		if (!(subject in helper.cache.getSubjects())) {
			return helper.respond("❌ Subject doesn't exists!")
		}

		const assignments = helper.cache.getAssignments()
		if (assignments.find(a => a.getSubject() == subject)) {
			return helper.respond("❌ Subject has assignments bound to it!")
		}

		await helper.cache.deleteSubject(subject)
		await helper.cache.updateModifyChannelInline()

		helper.respond("✅ Subject deleted")
	}
} as iInteractionSubcommandFile
