import { commandParams } from "../../all"

export default async (...params: commandParams) => {
	const [
		dip,
		cache,
		message,
		match,
		clear,
		sendMessage,
		updateModifyChannelInline,
		,
		CHECK_MARK,
		CROSS_MARK
	] = params
	if (!match("^--discard$")) return
	dip("drafts--discard")

	const draft = cache.getDraft()
	if (!draft) {
		// : No draft to discard
		clear(5000)
		message.react(CROSS_MARK).then()
		sendMessage("No draft to discard", 6000).then()
		return
	}
	await cache.removeDraft()
	await updateModifyChannelInline()

	// *
	clear(5000)
	message.react(CHECK_MARK).then()
}
