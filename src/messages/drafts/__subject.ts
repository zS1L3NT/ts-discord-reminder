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
	if (!MatchMore("--subject")) return
	dip("drafts--subject")

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

	const FullSubjectRegex = Match(
		`^--subject +(${cache.getSubjects().join("|")})`
	)

	if (!FullSubjectRegex) {
		// : No new subject given to draft
		Clear(5000)
		React(CROSS_MARK)
		Respond(`Make sure the subject is an existing subject`, 6000)
		return
	}

	const [subject] = FullSubjectRegex
	await draft.setSubject(subject)
	await cache.updateModifyChannelInline()

	// *
	Clear(5000)
	React(CHECK_MARK)
}
