import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("delete")
		.setDescription("Delete an reminder by it's ID")
		.addStringOption(option =>
			option
				.setName("id")
				.setDescription(
					"ID of the reminder. This is show in each reminder"
				)
				.setRequired(true)
		),
	execute: async helper => {
		const id = helper.string("id", true)!
		const reminder = helper.cache.getReminder(id)

		if (!reminder) {
			return helper.respond(`❌ Reminder does not exist`)
		}

		await helper.cache.removeReminder(id)
		helper.cache.updateRemindersChannel().then()

		helper.respond(`✅ Reminder deleted`)
	}
} as iInteractionSubcommandFile
