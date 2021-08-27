import { iInteractionSubcommandFile } from "../../app"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import DateFunctions from "../../utilities/DateFunctions"
import Draft from "../../models/Draft"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("date")
		.setDescription("Set the due date of the existing draft")
		.addStringOption(option =>
			option
				.setName("date")
				.setDescription(
					"Due date of the assignment.\nMake sure the date is in the format `<DD>/<MM>/<YYYY> <hh>:<mm>`"
				)
				.setRequired(true)
		),
	execute: async helper => {
		const draft = helper.cache.getDraft()
		if (!draft) {
			return helper.respond("❌ No draft to edit")
		}

		const date_string = helper.string("date", true)!
		const FullDateRegex = date_string.match(
			" *(\\d{2})\\/(\\d{2})\\/(\\d{4}) +(\\d{2}):(\\d{2})"
		)

		if (!FullDateRegex) {
			return helper.respond(
				`❌ Date format invalid. Make sure the date is in the format \`<DD>/<MM>/<YYYY> <hh>:<mm>\``
			)
		}

		let date: Date
		try {
			date = DateFunctions.verify(FullDateRegex.slice(1))
		} catch (err) {
			return helper.respond(`❌ ${err}`)
		}

		await draft.setDate(date.getTime())
		await helper.cache.updateModifyChannelInline()

		helper.respond({
			content: `✅ Draft date updated`,
			embeds: [Draft.getFormatted(draft)]
		})
	}
} as iInteractionSubcommandFile
