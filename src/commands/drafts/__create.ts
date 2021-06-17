import { allParameters, Draft } from "../../all"

export default async (allParameters: allParameters) => {
	const {
		dip,
		cache,
		message,
		match,
		clear,
		sendMessage,
		updateModifyChannelInline,
		CHECK_MARK,
		CROSS_MARK
	} = allParameters
	if (!match("^--create(?:(?= *$)(?!\\w+))")) return
	dip("drafts--create")

	const draft = cache.getDraft()
	if (draft) {
		// : Cannot create draft because draft already exists
		clear(5000)
		message.react(CROSS_MARK).then()
		sendMessage(
			"Try using `--discard` to discard current assignment an create a new one",
			6000
		).then()
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
	await updateModifyChannelInline()

	// *
	clear(5000)
	message.react(CHECK_MARK).then()
}
