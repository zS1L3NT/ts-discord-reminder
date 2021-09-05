import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import Reminder from "../../models/Reminder"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("show")
		.setDescription("Show the current draft"),
	execute: async helper => {
		helper.respond({
			embeds: [Reminder.getDraftEmbed(helper.cache.draft)]
		})
	}
} as iInteractionSubcommandFile
