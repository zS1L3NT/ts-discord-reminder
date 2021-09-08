import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { TextChannel } from "discord.js"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("reminders-channel")
		.setDescription(
			"Refresh reminders in the reminders channel"
		),
	execute: async helper => {
		const channel = helper.cache.guild.channels.cache.get(helper.cache.getRemindersChannelId())
		if (channel instanceof TextChannel) {
			await helper.cache.updateRemindersChannel()
			helper.respond("✅ Reminders channel refreshed")
		}
		else {
			helper.respond("❌ No reminders channel set")
		}
	}
} as iInteractionSubcommandFile
