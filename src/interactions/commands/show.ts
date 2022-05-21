import { BaseCommand, CommandHelper } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import Reminder from "../../data/Reminder"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		name: "show",
		description: "Shows the current draft"
	}

	override middleware = []

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		helper.respond({
			embeds: [Reminder.toDraftMessageEmbed(helper.cache.draft, helper.cache.guild)]
		})
	}
}
