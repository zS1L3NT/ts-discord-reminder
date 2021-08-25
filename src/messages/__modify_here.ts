import { iMessageParameters } from "../utilities/MessageParameters"

export default async (parameters: iMessageParameters) => {
	const {
		dip,
		cache,
		message,
		MatchOnly,
		Clear,
		React,
		Respond,
		CHECK_MARK,
		CROSS_MARK
	} = parameters
	if (!MatchOnly("--modify-here")) return
	dip("--modify-here")

	Clear(5000)
	switch (message.channel.id) {
		case cache.getNotifyChannelId():
			React(CROSS_MARK)
			Respond("This channel is already the notify channel!", 5000)
			break
		case cache.getModifyChannelId():
			React(CROSS_MARK)
			Respond("This channel is already the modify channel!", 5000)
			break
		case cache.getPingChannelId():
			React(CROSS_MARK)
			Respond("This channel is already the ping channel!", 5000)
			break
		default:
			await cache.setModifyChannelId(message.channel.id)
			React(CHECK_MARK)
			break
	}
}
