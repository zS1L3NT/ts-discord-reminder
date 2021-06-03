import {Guild, TextChannel} from "discord.js"
import {GuildCache, updateModifyChannel, updateNotifyChannel} from "../all"

export default async (guild: Guild, cache: GuildCache, debugCount: number) => {
	console.time(`Updated Channels for Guild(${guild.name}) [${debugCount}]`)

	// Update notify channel
	const notifyChannelId = cache.getNotifyChannelId()
	if (notifyChannelId) {
		const channel = guild.channels.cache.get(notifyChannelId)
		if (channel) {
			const notifyChannel = channel as TextChannel
			const assignments = cache.getAssignments()

			// Deletes any unnecessary messages from notify channel
			const messages = (await notifyChannel.messages.fetch({limit: 100})).array()
			const assignmentMessageIds = assignments.map(a => a.getMessageId())
			for (let i = 0, il = messages.length; i < il; i++) {
				const message = messages[i]
				if (!assignmentMessageIds.includes(message.id)) {
					// ! Unidentified message
					console.warn(`Message(${message.content}) exists in Channel(${notifyChannel.name})`)
					await message.delete()
				}
			}

			// Updates each assignment individually
			// If message doesn't exist, refresh all assignments to restore order
			for (let i = 0, il = assignments.length; i < il; i++) {
				const assignment = assignments[i]
				try {
					// * Edited assignment message
					const message = await notifyChannel.messages.fetch(assignment.getMessageId())
					await message.edit(assignment.getFormatted())
				} catch (e) {
					// ! Assignment message doesn't exist
					console.warn(`Channel(${notifyChannel.name}) has no Message(${assignment.getMessageId()})`)
					await updateNotifyChannel(cache, notifyChannel)
					break
				}
			}
		} else {
			// ! Channel doesn't exist
			console.log(`Guild(${guild.name}) has no Channel(${cache.getNotifyChannelId()})`)
			await cache.setNotifyChannelId("")
		}
	}

	// Update modify channel
	const modifyChannelId = cache.getModifyChannelId()
	if (modifyChannelId) {
		const channel = guild.channels.cache.get(modifyChannelId)
		if (channel) {
			const modifyChannel = channel as TextChannel
			await updateModifyChannel(cache, modifyChannel)
		} else {
			// ! Channel doesn't exist
			console.log(`Guild(${guild.name}) has no Channel(${modifyChannelId})`)
			await cache.setModifyChannelId("")
		}
	}

	console.timeEnd(`Updated Channels for Guild(${guild.name}) [${debugCount}]`)
}
