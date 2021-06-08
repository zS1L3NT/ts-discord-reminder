import { commandParams } from "../../all"

export default async (...params: commandParams) => {
	const [
		dip,
		cache,
		message,
		match,
		clear,
		sendMessage,
		,
		updateNotifyChannelInline,
		CHECK_MARK,
		CROSS_MARK
	] = params
	if (!match("^--delete")) return
	dip("drafts--delete")

	const DeleteIdRegex = match("^--delete (.+)")
	if (!DeleteIdRegex) {
		// : No id given to reference an assignment
		clear(5000)
		message.react(CROSS_MARK).then()
		sendMessage(
			"Try adding the assignment id after the `--delete` command",
			6000
		).then()
		return
	}

	const [, id] = DeleteIdRegex
	const assignment = cache.getAssignment(id)

	if (!assignment) {
		// : No assignment exists for given id
		clear(5000)
		message.react(CROSS_MARK).then()
		sendMessage("No such assignment", 6000).then()
		return
	}

	await cache.removeAssignment(id)
	await updateNotifyChannelInline()

	// *
	clear(5000)
	message.react(CHECK_MARK).then()
}