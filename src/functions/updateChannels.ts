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

			// Deletes any unnecessary messages from notify channel
			const messages = (
				await nChannel.messages.fetch({ limit: 100 })
			).array()
			const notifyMessageIds = cache.getNotifyMessageIds()
			for (let i = 0, il = messages.length; i < il; i++) {
				const message = messages[i]
				if (!notifyMessageIds.includes(message.id)) {
					// ! Unidentified message
					console.warn(
						`Message(${message.id}) exists in Channel(${nChannel.name})`
					)
					await message.delete().catch(() => {})
				}
			}

			await updateNotifyChannel(cache, nChannel)
		} else {
			// ! Channel doesn't exist
			console.warn(
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
					if (
						!message.content.match(/^--/) ||
						message.embeds.length > 0
					) {
						// ! Unidentified user message
						console.warn(
							`Message(${message.id}) exists in Channel(${mChannel.name})`
						)
						await message.delete().catch(() => {})
					}
				}
			}

			await updateModifyChannel(cache, mChannel)
		} else {
			// ! Channel doesn't exist
			console.warn(
				`Guild(${guild.name}) has no Channel(${modifyChannelId})`
			)
			await cache.setModifyChannelId("")
		}
	}

	console.timeEnd(`Updated Channels for Guild(${guild.name}) [${debugCount}]`)
}
