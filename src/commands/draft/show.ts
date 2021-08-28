import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { Draft } from "../../models/Reminder"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("show")
		.setDescription("Show the current draft"),
	execute: async helper => {
		helper.respond({
			embeds: [Draft.getFormatted(helper.cache.getDraft())]
		})
	}
} as iInteractionSubcommandFile
