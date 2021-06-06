import { Guild, TextChannel } from "discord.js"
import { GuildCache, updateModifyChannel, updateNotifyChannel } from "../all"

export default async (guild: Guild, cache: GuildCache, debugCount: number) => {
	console.time(`Updated Channels for Guild(${guild.name}) [${debugCount}]`)

	// Update notify channel
	const notifyChannelId = cache.getNotifyChannelId()
	if (notifyChannelId) {
		const channel = guild.channels.cache.get(notifyChannelId)
		if (channel) {
			const nChannel = channel as TextChannel
			const assignments = cache.getAssignments()

			// Deletes any unnecessary messages from notify channel
			const messages = (
				await nChannel.messages.fetch({ limit: 100 })
			).array()
			const assignmentMessageIds = assignments.map(a => a.getMessageId())
			for (let i = 0, il = messages.length; i < il; i++) {
				const message = messages[i]
				if (!assignmentMessageIds.includes(message.id)) {
					// ! Unidentified message
					console.warn(
						`Message(${message.content}) exists in Channel(${nChannel.name})`
					)
					await message.delete()
				}
			}

			// Updates each assignment individually
			// If message doesn't exist, refresh all assignments to restore order
			for (let i = 0, il = assignments.length; i < il; i++) {
				const assignment = assignments[i]
				try {
					// * Edited assignment message
					const message = await nChannel.messages.fetch(
						assignment.getMessageId()
					)
					await message.edit(
						assignment.getFormatted(cache.getColors())
					)
				} catch (e) {
					// ! Assignment message doesn't exist
					console.warn(
						`Channel(${
							nChannel.name
						}) has no Message(${assignment.getMessageId()})`
					)
					await updateNotifyChannel(cache, nChannel)
					break
				}
			}
		} else {
			// ! Channel doesn't exist
			console.log(
				`Guild(${
					guild.name
				}) has no Channel(${cache.getNotifyChannelId()})`
			)
			await cache.setNotifyChannelId("")
		}
	}

	// Update modify channel
	const modifyChannelId = cache.getModifyChannelId()
	const modifyMessageId = cache.getModifyMessageId()
	if (modifyChannelId) {
		const channel = guild.channels.cache.get(modifyChannelId)
		if (channel) {
			const mChannel = channel as TextChannel

			// Deletes any unnecessary messages from modify channel
			const messages = (
				await mChannel.messages.fetch({ limit: 100 })
			).array()
			for (let i = 0, il = messages.length; i < il; i++) {
				const message = messages[i]
				if (message.id !== modifyMessageId) {
					// : Message that isn't main message detected
					if (!message.content.match(/^--/) && !message.author.bot) {
						// ! Unidentified user message
						console.log(
							`Message(${message.content}) exists in Channel(${mChannel.name})`
						)
						await message.delete()
					}
				}
			}

			await updateModifyChannel(cache, mChannel)
		} else {
			// ! Channel doesn't exist
			console.log(
				`Guild(${guild.name}) has no Channel(${modifyChannelId})`
			)
			await cache.setModifyChannelId("")
		}
	}

	console.timeEnd(`Updated Channels for Guild(${guild.name}) [${debugCount}]`)
}
