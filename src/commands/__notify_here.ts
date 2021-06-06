import { commandParams } from "../all"

export default async (...params: commandParams) => {
	const [dip, cache, message, match, clear, sendMessage, , , CHECK_MARK] =
		params
	if (!match("^--notify-here$")) return
	dip("--notify-here")

	clear(5000)
	if (message.channel.id === cache.getModifyChannelId()) {
		await sendMessage("This channel is already the modify channel!", 5000)
	} else if (message.channel.id === cache.getNotifyChannelId()) {
		await sendMessage("This channel is already the notify channel!", 5000)
	} else {
		await cache.setNotifyChannelId(message.channel.id)
		await message.react(CHECK_MARK)
	}
}
