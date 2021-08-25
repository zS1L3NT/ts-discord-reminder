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
	if (!MatchMore("--delete")) return
	dip("drafts--delete")

	const DeleteIdRegex = Match("^--delete +(.+)")
	if (!DeleteIdRegex) {
		// : No id given to reference an assignment
		Clear(5000)
		React(CROSS_MARK)
		Respond(
			"Try adding the assignment id after the `--delete` command",
			6000
		)
		return
	}

	const [id] = DeleteIdRegex
	const assignment = cache.getAssignment(id)

	if (!assignment) {
		// : No assignment exists for given id
		Clear(5000)
		React(CROSS_MARK)
		Respond("No such assignment", 6000)
		return
	}

	await cache.removeAssignment(id)
	await cache.updateNotifyChannelInline()

	// *
	Clear(5000)
	React(CHECK_MARK)
}
