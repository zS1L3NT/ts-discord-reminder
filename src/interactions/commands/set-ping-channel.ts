import { TextChannel } from "discord.js"
import {
	BaseCommand, CommandHelper, CommandType, IsAdminMiddleware, ResponseBuilder
} from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Set the channel where the bot pings all users about Reminders",
		options: [
			{
				name: "channel",
				description: [
					"The channel which you would want ping to be sent to",
					"Leave this empty to unset the log channel"
				].join("\n"),
				type: "channel" as const,
				requirements: "Valid Text Channel",
				required: false,
				default: "Unsets the channel"
			}
		]
	}

	override only = CommandType.Slash
	override middleware = [new IsAdminMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const channel = helper.channel("channel")
		if (channel instanceof TextChannel) {
			switch (channel.id) {
				case helper.cache.getRemindersChannelId():
					helper.respond(
						ResponseBuilder.bad("This channel is already the Reminders channel!")
					)
					break
				case helper.cache.getPingChannelId():
					helper.respond(ResponseBuilder.bad("This channel is already the ping channel!"))
					break
				default:
					await helper.cache.setPingChannelId(channel.id)
					helper.respond(
						ResponseBuilder.good(`Pinging channel reassigned to \`#${channel.name}\``)
					)
					break
			}
		} else if (channel === null) {
			await helper.cache.setPingChannelId("")
			helper.respond(ResponseBuilder.good(`Pinging channel unassigned`))
		} else {
			helper.respond(ResponseBuilder.bad(`Please select a text channel`))
		}
	}
}
