import { iMessageParameters } from "../../utilities/MessageParameters"

export default async (parameters: iMessageParameters) => {
	const {
		dip,
		cache,
		Match,
		MatchMore,
		Clear,
		React,
		Respond,
		CHECK_MARK,
		CROSS_MARK
	} = parameters
	if (!MatchMore("--name")) return
	dip("drafts--name")

	const draft = cache.getDraft()
	if (!draft) {
		// : Cannot edit draft because draft doesn't exists
		Clear(5000)
		React(CROSS_MARK)
		Respond(
			"Try using `--create` to create an assignment draft first",
			6000
		)
		return
	}

	const FullNameRegex = Match("^--name +(.+)")
	if (!FullNameRegex) {
		// : No new name given to draft
		Clear(5000)
		React(CROSS_MARK)
		Respond("Make sure to add the name after the `--name`", 6000)
		return
	}

	const [name] = FullNameRegex
	await draft.setName(name)
	await cache.updateModifyChannelInline()

	// *
	Clear(5000)
	React(CHECK_MARK)
}
