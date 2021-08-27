import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../app"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("create")
		.setDescription("Create a new subject that can be set on an assignment")
		.addStringOption(option =>
			option
				.setName("subject")
				.setDescription(
					"The string identifier for the subject. Keep this short"
				)
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

		if (subject in helper.cache.getSubjects()) {
			return helper.respond("❌ Subject already exists!")
		}

		if (!color.match(/#[A-Fa-f0-9]{6}/)) {
			return helper.respond(
				"Invalid color hex. Must start with a # and have 6 hexadecimal characters"
			)
		}

		await helper.cache.changeSubject(subject, color)
		await helper.cache.updateModifyChannelInline()

		helper.respond("✅ Subject created")
	}
} as iInteractionSubcommandFile
