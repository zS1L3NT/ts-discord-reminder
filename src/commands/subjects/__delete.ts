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
		CHECK_MARK,
		CROSS_MARK
	} = allParameters
	if (!match("^--delete(?:(?= *)(?!\\w+))")) return
	dip("subjects--delete")

	const FullDeleteRegex = match("^--delete +(.+)")
	if (!FullDeleteRegex) {
		clear(5000)
		message.react(CROSS_MARK).then()
		sendMessage(
			"Try adding the subject code after the `--delete` command",
			6000
		).then()
		return
	}

	const [code] = FullDeleteRegex
	const subjects = cache.getSubjects()
	if (subjects.indexOf(code) < 0) {
		clear(5000)
		message.react(CROSS_MARK).then()
		sendMessage("Subject doesn't exists!", 6000).then()
		return
	}

	const assignments = cache.getAssignments()
	if (assignments.filter(a => a.getSubject() === code).length > 0) {
		clear(5000)
		message.react(CROSS_MARK).then()
		sendMessage(
			"You can't delete a subject if it has assignments!",
			6000
		).then()
		return
	}

	await cache.deleteSubject(code)
	await updateModifyChannelInline()

	// *
	clear(5000)
	message.react(CHECK_MARK).then()
}
