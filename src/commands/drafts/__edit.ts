import { commandParams } from "../../all"

export default async (...params: commandParams) => {
	const [
		dip,
		cache,
		,
		match,
		clear,
		sendMessage,
		updateModifyChannelInline,
		updateNotifyChannelInline
	] = params
	if (!match("^--edit")) return
	dip("drafts--edit")

	if (cache.getDraft()) {
		// : Cannot edit draft because draft already exists
		clear(5000)
		await sendMessage(
			"Try using `--discard` to discard current assignment an create a new one",
			6000
		)
		return
	}

	const EditIdRegex = match("^--edit (.+)")
	if (!EditIdRegex) {
		// : No id given to reference an assignment
		clear(5000)
		await sendMessage(
			"Try adding the assignment id after the `--edit` command",
			6000
		)
		return
	}

	const [, id] = EditIdRegex
	const assignment = cache.getAssignment(id)

	if (!assignment) {
		// : No assignment exists for given id
		clear(5000)
		await sendMessage("No such assignment", 6000)
		return
	}

	const draft = await assignment.toDraft(cache)
	await draft.saveToFirestore()
	cache.setDraft(draft)
	await updateNotifyChannelInline()
	await updateModifyChannelInline()

	// *
	clear(6000)
	await sendMessage(
		"Try using `--date`, `--info ++ <detail to add>` or `--info -- <index to remove>` to edit info about assignment",
		7000
	)
}
