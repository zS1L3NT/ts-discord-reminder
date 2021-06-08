import { commandParams } from "../../all"

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
	if (!match("^--delete")) return
	dip("subjects--delete")

	const FullDeleteRegex = match("^--delete (.+)")
	if (!FullDeleteRegex) {
		clear(5000)
		await sendMessage(
			"Try adding the subject code after the `--delete` command",
			6000
		)
		return
	}

	const [, code] = FullDeleteRegex
	const subjects = cache.getSubjects()
	if (subjects.indexOf(code) < 0) {
		clear(5000)
		await sendMessage("Subject doesn't exists!", 6000)
		return
	}

	const assignments = cache.getAssignments()
	if (assignments.filter(a => a.getSubject() === code).length > 0) {
		clear(5000)
		await sendMessage(
			"You can't delete a subject if it has assignments!",
			6000
		)
		return
	}

	await cache.deleteSubject(code)
	await updateModifyChannelInline()

	// *
	clear(5000)
	await message.react(CHECK_MARK)
}
