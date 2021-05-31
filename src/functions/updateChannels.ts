import { Guild, TextChannel } from "discord.js"
import { updateNotifyChannel, GuildCache, Draft } from "../all"

export default async (guild: Guild, cache: GuildCache) => {
	// Update notify channel
	const notifyChannelId = cache.getNotifyChannelId()
	if (notifyChannelId) {
		const channel = guild.channels.cache.get(notifyChannelId)
		if (channel) {
			const notifyChannel = channel as TextChannel
			const assignments = cache.getAssignments()

			// Deletes any unnecessary messages from notify channel
			const messages = (await notifyChannel.messages.fetch({ limit: 100 })).array()
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
	const modifyMessageId = cache.getModifyMessageId()
	if (modifyChannelId) {
		const channel = guild.channels.cache.get(modifyChannelId)
		if (channel) {
			const modifyChannel = channel as TextChannel
			const draft = cache.getDraft()

			// Deletes any unnecessary messages from modify channel
			const messages = (await modifyChannel.messages.fetch({ limit: 100 })).array()
			for (let i = 0, il = messages.length; i < il; i++) {
				const message = messages[i]
				if (message.id !== modifyMessageId) {
					// ! Unidentified message
					console.log(`Message(${message.content}) exists in Channel(${modifyChannel.name})`)
					message.delete()
				} else {
					// * Edited modify message
					message.edit(Draft.getFormatted(draft))
				}
			}

			// Sends the message to modify channel if it doesnt exist
			if (messages.filter(message => message.id === modifyMessageId).length === 0) {
				// ! Modify message doesn't exist
				console.log(`Channel(${modifyChannel.name}) has no Message(${modifyMessageId})`)
				const main = await modifyChannel.send(Draft.getFormatted(draft))
				await cache.setModifyMessageId(main.id)
			}
		} else {
			// ! Channel doesn't exist
			console.log(`Guild(${guild.name}) has no Channel(${modifyChannelId})`)
			await cache.setModifyChannelId("")
		}
	}
}
