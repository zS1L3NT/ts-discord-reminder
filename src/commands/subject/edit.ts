import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../app"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("edit")
		.setDescription("Edit a subject's color")
		.addStringOption(option =>
			option
				.setName("subject")
				.setDescription("The string identifier for the subject")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("color")
				.setDescription("Color hex of the color. e.g. #FFFFFF")
				.setRequired(true)
		),
	execute: async helper => {
		const subject = helper.string("subject", true)!
		const color = helper.string("color", true)!

		if (!(subject in helper.cache.getSubjects())) {
			return helper.respond("❌ Subject doesn't exists!")
		}

		await helper.cache.changeSubject(subject, color)
		await helper.cache.updateModifyChannelInline()

		helper.respond("✅ Subject edited")
	}
} as iInteractionSubcommandFile
