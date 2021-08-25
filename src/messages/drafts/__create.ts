import { iMessageParameters } from "../../utilities/MessageParameters"
import Draft from "../../models/Draft"

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
	if (!MatchOnly("--create")) return
	dip("drafts--create")

	const draft = cache.getDraft()
	if (draft) {
		// : Cannot create draft because draft already exists
		Clear(5000)
		React(CROSS_MARK)
		Respond(
			"Try using `--discard` to discard current assignment an create a new one",
			6000
		)
		return
	}
	const assignment = new Draft(
		cache,
		cache.generateAssignmentId(),
		"",
		"",
		new Date().getTime(),
		[]
	)
	await assignment.saveToFirestore()
	cache.setDraft(assignment)
	await cache.updateModifyChannelInline()

	// *
	Clear(5000)
	React(CHECK_MARK)
}
