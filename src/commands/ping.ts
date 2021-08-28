import { iInteractionFile } from "../utilities/BotSetupHelper"
import { SlashCommandBuilder } from "@discordjs/builders"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Test if the bot is alive"),
	execute: async helper => {
		helper.respond("Pong!")
	}
} as iInteractionFile
