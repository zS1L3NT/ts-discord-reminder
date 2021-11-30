import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"
import Reminder from "../../models/Reminder"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

const file: iInteractionSubcommandFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: "Creates a draft for a reminder that you should make changes to",
		params: []
	},
	builder: new SlashCommandSubcommandBuilder()
		.setName("create")
		.setDescription("Create a draft of a reminder to make changes to"),
	execute: async helper => {
		const draft = helper.cache.draft
		if (draft) {
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"Discard the existing draft before creating a new one"
				)
			)
		}

		const reminder = Reminder.getEmpty()
		reminder.value.id = "draft"

		await helper.cache.getDraftDoc().set(reminder.value)
		helper.cache.draft = reminder

		helper.respond({
			embeds: [
				new ResponseBuilder(Emoji.GOOD, `Created draft`).build(),
				Reminder.getDraftEmbed(helper.cache.draft, helper.cache.guild)
			]
		})
	}
}

export default file
