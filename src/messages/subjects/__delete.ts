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
	dip("subjects--delete")

	const FullDeleteRegex = Match("^--delete +(.+)")
	if (!FullDeleteRegex) {
		Clear(5000)
		React(CROSS_MARK)
		Respond(
			"Try adding the subject code after the `--delete` command",
			6000
		)
		return
	}

	const [code] = FullDeleteRegex
	const subjects = cache.getSubjects()
	if (subjects.indexOf(code) < 0) {
		Clear(5000)
		React(CROSS_MARK)
		Respond("Subject doesn't exists!", 6000)
		return
	}

	const assignments = cache.getAssignments()
	if (assignments.filter(a => a.getSubject() === code).length > 0) {
		Clear(5000)
		React(CROSS_MARK)
		Respond("You can't delete a subject if it has assignments!", 6000)
		return
	}

	await cache.deleteSubject(code)
	await cache.updateModifyChannelInline()

	// *
	Clear(5000)
	React(CHECK_MARK)
}
