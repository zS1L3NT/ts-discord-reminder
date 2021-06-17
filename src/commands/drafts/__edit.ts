import { allParameters } from "../../all"

export default async (allParameters: allParameters) => {
	const {
		dip,
		cache,
		message,
		match,
		clear,
		sendMessage,
		updateModifyChannelInline,
		updateNotifyChannelInline,
		CHECK_MARK,
		CROSS_MARK
	} = allParameters
	if (!match("^--edit(?:(?= *)(?!\\w+))")) return
	dip("drafts--edit")

	if (cache.getDraft()) {
		// : Cannot edit draft because draft already exists
		clear(5000)
		message.react(CROSS_MARK).then()
		sendMessage(
			"Try using `--discard` to discard current assignment an create a new one",
			6000
		).then()
		return
	}

	const EditIdRegex = match("^--edit +(.+)")
	if (!EditIdRegex) {
		// : No id given to reference an assignment
		clear(5000)
		message.react(CROSS_MARK).then()
		sendMessage(
			"Try adding the assignment id after the `--edit` command",
			6000
		).then()
		return
	}

	const [id] = EditIdRegex
	const assignment = cache.getAssignment(id)

	if (!assignment) {
		// : No assignment exists for given id
		clear(5000)
		message.react(CROSS_MARK).then()
		sendMessage("No such assignment", 6000).then()
		return
	}

	const draft = await assignment.toDraft(cache)
	await draft.saveToFirestore()
	cache.setDraft(draft)
	await updateNotifyChannelInline()
	await updateModifyChannelInline()

	// *
	clear(5000)
	message.react(CHECK_MARK).then()
}
