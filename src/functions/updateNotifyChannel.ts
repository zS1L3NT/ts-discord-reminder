import { TextChannel } from "discord.js"
import { GuildCache } from "../all"

// : Assume that the notify channel exists
export default async (cache: GuildCache, nChannel: TextChannel) => {
	const assignments = cache
		.getAssignments()
		.filter(assignment => {
			if (assignment.getDate() < new Date().getTime()) {
				cache.removeAssignment(assignment.getId())
				return false
			}
			return true
		})
		.sort((a, b) => b.getDate() - a.getDate())
	const notifyMessageIds = cache.getNotifyMessageIds()

	// Check if a message exists for each id
	for (let i = 0, il = notifyMessageIds.length; i < il; i++) {
		const notifyMessageId = notifyMessageIds[i]
		try {
			// * Edited assignment message
			await nChannel.messages.fetch(notifyMessageId)
		} catch (e) {
			// ! Assignment message doesn't exist
			console.warn(
				`Channel(${nChannel.name}) has no Message(${notifyMessageId})`
			)
			await cache.removeNotifyMessageId(notifyMessageId)
		}
	}

	const requiredMessages =
		assignments.length - cache.getNotifyMessageIds().length
	for (let i = 0; i < requiredMessages; i++) {
		const main = await nChannel.send("\u200B")
		await cache.pushNotifyMessageId(main.id)
	}

	const colors = cache.getColors()
	for (let i = 0, il = notifyMessageIds.length; i < il; i++) {
		const notifyMessageId = notifyMessageIds[i]
		const assignment = assignments[i]
		const message = await nChannel.messages.cache.get(notifyMessageId)
		if (message) {
			if (assignment) {
				await message.edit(assignment.getFormatted(colors))
			} else {
				await cache.removeNotifyMessageId(notifyMessageId)
			}
		}
	}
}
