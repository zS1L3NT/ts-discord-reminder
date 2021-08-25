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
	if (!MatchMore("--edit")) return
	dip("drafts--edit")

	if (cache.getDraft()) {
		// : Cannot edit draft because draft already exists
		Clear(5000)
		React(CROSS_MARK)
		Respond(
			"Try using `--discard` to discard current assignment an create a new one",
			6000
		)
		return
	}

	const EditIdRegex = Match("^--edit +(.+)")
	if (!EditIdRegex) {
		// : No id given to reference an assignment
		Clear(5000)
		React(CROSS_MARK)
		Respond("Try adding the assignment id after the `--edit` command", 6000)
		return
	}

	const [id] = EditIdRegex
	const assignment = cache.getAssignment(id)

	if (!assignment) {
		// : No assignment exists for given id
		Clear(5000)
		React(CROSS_MARK)
		Respond("No such assignment", 6000)
		return
	}

	const draft = await assignment.toDraft(cache)
	await draft.saveToFirestore()
	cache.setDraft(draft)
	await cache.updateNotifyChannelInline()
	await cache.updateModifyChannelInline()

	// *
	Clear(5000)
	React(CHECK_MARK)
}
