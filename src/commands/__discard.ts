import { commandParams } from "../all"

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
		CHECK_MARK
	] = params
	if (!match("^--discard$")) return
	dip("--discard")

	const draft = cache.getDraft()
	if (!draft) {
		// : No draft to discard
		clear(5000)
		await sendMessage("No draft to discard", 6000)
		return
	}
	await cache.removeDraft()
	await updateModifyChannelInline()

	// *
	clear(5000)
	await message.react(CHECK_MARK)
}
