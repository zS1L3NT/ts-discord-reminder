import {TextChannel} from "discord.js"
import {GuildCache} from "../all"

// : Assume that the notify channel exists
export default async (cache: GuildCache, channel: TextChannel) => {
	const assignments = cache.getAssignments().sort((a, b) => b.getDate() - a.getDate())

	// Clear last 100 messages from chat
	const messages = await channel.messages.fetch({limit: 100})
	if (messages.size > 0) await channel.bulkDelete(messages.size)

	for (let i = 0, il = assignments.length; i < il; i++) {
		const assignment = assignments[i]

		// * Sent assignment info notify channel
		const message = await channel.send(assignment.getFormatted())
		await assignment.setMessageId(message.id)
	}
}
