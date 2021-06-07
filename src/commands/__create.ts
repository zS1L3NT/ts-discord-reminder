import { commandParams, Draft } from "../all"

export default async (...params: commandParams) => {
	const [
		dip,
		cache,
		message,
		match,
		clear,
		sendMessage,
		updateModifyChannelInline,
		,
		CHECK_MARK
	] = params
	if (!match("^--create$")) return
	dip("--create")

	const draft = cache.getDraft()
	if (draft) {
		// : Cannot create draft because draft already exists
		clear(5000)
		await sendMessage(
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
	await updateModifyChannelInline()

	// *
	clear(5000)
	await message.react(CHECK_MARK)
}
