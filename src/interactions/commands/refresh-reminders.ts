import { TextChannel } from "discord.js"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Manually refresh the Reminders channel if it has been set"
	}

	override middleware = []

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand("refresh-reminders", "only")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const channel = await helper.cache.guild.channels.fetch(
			helper.cache.getRemindersChannelId()
		)
		if (channel instanceof TextChannel) {
			await helper.cache.updateRemindersChannel()
			helper.respond(ResponseBuilder.good("Reminders channel refreshed"))
		} else {
			helper.respond(ResponseBuilder.bad("No Reminders channel set"))
		}
	}
}
