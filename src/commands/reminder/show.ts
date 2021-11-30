import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"
import Reminder from "../../models/Reminder"
import { iInteractionSubcommandFile } from "discordjs-nova"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

const file: iInteractionSubcommandFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: "Shows the current draft",
		params: []
	},
	builder: new SlashCommandSubcommandBuilder()
		.setName("show")
		.setDescription("Show the current draft"),
	execute: async helper => {
		helper.respond({
			embeds: [Reminder.getDraftEmbed(helper.cache.draft, helper.cache.guild)]
		})
	}
}

export default file
