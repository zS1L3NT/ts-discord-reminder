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
	if (!MatchOnly("--done")) return
	dip("drafts--done")

	const draft = cache.getDraft()
	if (!draft) {
		// :
		Clear(5000)
		React(CROSS_MARK)
		Respond(
			"Try using `--create` to create an assignment draft first",
			6000
		)
		return
	}

	if (draft.getDate() < new Date().getTime()) {
		// :
		Clear(5000)
		React(CROSS_MARK)
		Respond(
			"Try using `--date <DD>/<MM>/<YYYY> <hh>:<mm>` to add a date to the assignment",
			6000
		)
		return
	}

	if (draft.getName() === "") {
		Clear(5000)
		React(CROSS_MARK)
		Respond(
			"Try using `--name <task name>` to add a name to the assignment",
			6000
		)
		return
	}

	if (draft.getSubject() === "") {
		Clear(5000)
		React(CROSS_MARK)
		Respond(
			"Try using `--subject <subject name>` to add a subject to the assignment",
			6000
		)
		return
	}

	await cache.pushAssignment(draft)
	await cache.removeDraft()
	await cache.updateNotifyChannelInline()
	await cache.updateModifyChannelInline()

	// *
	Clear(5000)
	React(CHECK_MARK)
}
