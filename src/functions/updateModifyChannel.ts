import { TextChannel } from "discord.js"
import { Draft, GuildCache } from "../all"

// : Assume that the modify channel exists
export default async (cache: GuildCache, mChannel: TextChannel) => {
	const draft = cache.getDraft()
	const modifyMessageId = cache.getModifyMessageId()
	const message = mChannel.messages.cache.get(modifyMessageId)

	if (message) {
		await message.edit(Draft.getFormatted(draft))
	} else {
		// ! Modify message doesn't exist
		console.warn(
			`Channel(${mChannel.name}) has no Message(${modifyMessageId})`
		)
		const main = await mChannel.send(Draft.getFormatted(draft))
		await cache.setModifyMessageId(main.id)
	}
}
