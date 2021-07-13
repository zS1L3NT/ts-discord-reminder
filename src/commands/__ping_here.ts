import { allParameters } from "../all"

export default async (allParameters: allParameters) => {
	const {
		dip,
		cache,
		message,
		match,
		clear,
		sendMessage,
		CHECK_MARK,
		CROSS_MARK
	} = allParameters
	if (!match("^--ping-here(?:(?= *$)(?!\\w+))")) return
	dip("--ping-here")

	clear(5000)
	switch (message.channel.id) {
		case cache.getNotifyChannelId():
			message.react(CROSS_MARK).then()
			sendMessage(
				"This channel is already the notify channel!",
				5000
			).then()
			break
		case cache.getModifyChannelId():
			message.react(CROSS_MARK).then()
			sendMessage(
				"This channel is already the modify channel!",
				5000
			).then()
			break
		case cache.getPingChannelId():
			message.react(CROSS_MARK).then()
			sendMessage(
				"This channel is already the ping channel!",
				5000
			).then()
			break
		default:
			await cache.setPingChannelId(message.channel.id)
			message.react(CHECK_MARK).then()
			break
	}
}
