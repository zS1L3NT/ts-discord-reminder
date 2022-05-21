import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import Reminder from "../../data/Reminder"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Creates a draft for a Reminder that you should make changes to"
	}

	override middleware = []

	override condition(helper: CommandHelper<Entry, GuildCache>): boolean | void {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const draft = helper.cache.draft
		if (draft) {
			return helper.respond(
				ResponseBuilder.bad("Discard the existing draft before creating a new one")
			)
		}

		const reminder = Reminder.getEmpty()
		reminder.id = "draft"

		await helper.cache.getDraftDoc().set(reminder)
		helper.cache.draft = reminder

		helper.respond({
			embeds: [
				ResponseBuilder.good(`Created draft`).build(),
				Reminder.toDraftMessageEmbed(helper.cache.draft, helper.cache.guild)
			]
		})
	}
}
