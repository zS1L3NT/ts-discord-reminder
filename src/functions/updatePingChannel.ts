import { Assignment, formatDueIn, GuildCache } from "../all"
import { Guild, TextChannel } from "discord.js"

export default async (
	cache: GuildCache,
	guild: Guild,
	assignment: Assignment
) => {
	const pingChannelId = cache.getPingChannelId()

	const channel = guild.channels.cache.get(pingChannelId)
	if (channel) {
		const textChannel = channel as TextChannel
		textChannel
			.send(
				`@everyone ${assignment.getSubject()} ${assignment.getName()} is due in ${formatDueIn(
					assignment.getDate()
				)}!`,
				{
					embed: assignment.getFormatted(cache.getColors())
				}
			)
			.then()
	}
}
