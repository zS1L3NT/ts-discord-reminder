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
	if (!MatchMore("--create")) return
	dip("subject--create")

	const FullCreateRegex = Match("^--create +(.+) +(#[A-Fa-f0-9]{6})")
	if (!FullCreateRegex) {
		Clear(5000)
		React(CROSS_MARK)
		Respond(
			"Try adding the subject code and the color after the `--create` command",
			6000
		)
		return
	}

	const [code, color] = FullCreateRegex
	const subjects = cache.getSubjects()
	if (subjects.indexOf(code) >= 0) {
		Clear(5000)
		React(CROSS_MARK)
		Respond("Subject already exists!", 6000)
		return
	}

	await cache.changeSubject(code, color)
	await cache.updateModifyChannelInline()

	// *
	Clear(5000)
	React(CHECK_MARK)
}
