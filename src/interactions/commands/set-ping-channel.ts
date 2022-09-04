import { Colors, TextChannel } from "discord.js"
import {
	BaseCommand, CommandHelper, CommandType, IsAdminMiddleware, ResponseBuilder
} from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
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

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const oldChannelId = helper.cache.entry.ping_channel_id
		const channel = helper.channel("channel")

		if (channel instanceof TextChannel) {
			switch (channel.id) {
				case helper.cache.entry.reminders_channel_id:
					helper.respond(
						ResponseBuilder.bad("This channel is already the Reminders channel!")
					)
					break
				case helper.cache.entry.ping_channel_id:
					helper.respond(ResponseBuilder.bad("This channel is already the ping channel!"))
					break
				default:
					await helper.cache.update({ ping_channel_id: channel.id })
					helper.respond(
						ResponseBuilder.good(`Pinging channel reassigned to \`#${channel.name}\``)
					)
					helper.cache.logger.log({
						member: helper.member,
						title: `Ping channel changed`,
						description: [
							`<@${helper.member.id}> changed the ping channel`,
							oldChannelId ? `**Old Ping Channel**: <#${oldChannelId}>` : null,
							`**New Ping Channel**: <#${channel.id}>`
						].join("\n"),
						command: "set-ping-channel",
						color: Colors.Blue
					})
					break
			}
		} else if (channel === null) {
			await helper.cache.update({ ping_channel_id: null })
			helper.respond(ResponseBuilder.good(`Pinging channel unassigned`))
			helper.cache.logger.log({
				member: helper.member,
				title: `Ping channel unassigned`,
				description: `<@${helper.member.id}> unassigned the ping channel\b**Old Ping Channel**: <#${oldChannelId}>`,
				command: "set-ping-channel",
				color: Colors.Blue
			})
		} else {
			helper.respond(ResponseBuilder.bad(`Please select a text channel`))
		}
	}
}
