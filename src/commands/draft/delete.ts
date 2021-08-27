import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../app"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("delete")
		.setDescription("Delete an assignment by it's ID")
		.addStringOption(option =>
			option
				.setName("id")
				.setDescription(
					"ID of the assignment. This is show in each assignment"
				)
				.setRequired(true)
		),
	execute: async helper => {
		const id = helper.string("id", true)!
		const assignment = helper.cache.getAssignment(id)

		if (!assignment) {
			return helper.respond(`❌ Assignment does not exist`)
		}

		await helper.cache.removeAssignment(id)
		await helper.cache.updateNotifyChannelInline()

		helper.respond(`✅ Assignment deleted`)
	}
} as iInteractionSubcommandFile
