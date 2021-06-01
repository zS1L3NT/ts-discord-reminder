import { TextChannel } from "discord.js";
import { Draft, GuildCache } from "../all";

// : Assume that the modify channel exists
export default async (cache: GuildCache, channel: TextChannel) => {
	const modifyMessageId = cache.getModifyMessageId()
	const draft = cache.getDraft()

	// Deletes any unnecessary messages from modify channel
	const messages = (await channel.messages.fetch({ limit: 100 })).array()
	for (let i = 0, il = messages.length; i < il; i++) {
		const message = messages[i]
		if (message.id !== modifyMessageId) {
			// ! Unidentified message
			console.log(`Message(${message.content}) exists in Channel(${channel.name})`)
			message.delete()
		} else {
			// * Edited modify message
			message.edit(Draft.getFormatted(draft))
		}
	}

	// Sends the message to modify channel if it doesnt exist
	if (messages.filter(message => message.id === modifyMessageId).length === 0) {
		// ! Modify message doesn't exist
		console.log(`Channel(${channel.name}) has no Message(${modifyMessageId})`)
		const main = await channel.send(Draft.getFormatted(draft))
		await cache.setModifyMessageId(main.id)
	}
}