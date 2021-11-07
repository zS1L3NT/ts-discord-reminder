import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import Reminder from "../../models/Reminder"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("show")
		.setDescription("Show the current draft"),
	execute: async helper => {
		helper.respond({
			embeds: [Reminder.getDraftEmbed(helper.cache.draft, helper.cache.guild)]
		})
	}
} as iInteractionSubcommandFile
