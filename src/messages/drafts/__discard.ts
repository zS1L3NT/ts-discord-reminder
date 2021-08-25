import { iMessageParameters } from "../../utilities/MessageParameters"

export default async (parameters: iMessageParameters) => {
	const {
		dip,
		cache,
		MatchOnly,
		Clear,
		React,
		Respond,
		CHECK_MARK,
		CROSS_MARK
	} = parameters
	if (!MatchOnly("--discard")) return
	dip("drafts--discard")

	const draft = cache.getDraft()
	if (!draft) {
		// : No draft to discard
		Clear(5000)
		React(CROSS_MARK)
		Respond("No draft to discard", 6000)
		return
	}
	await cache.removeDraft()
	await cache.updateModifyChannelInline()

	// *
	Clear(5000)
	React(CHECK_MARK)
}
