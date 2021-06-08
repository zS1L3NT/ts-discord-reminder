import { commandParams } from "../../functions/commandParams"

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
	if (!match("^--create")) return
	dip("subject--create")

	const FullCreateRegex = match("^--create (.+) (#[A-Fa-f0-9]{3,6})$")
	if (!FullCreateRegex) {
		clear(5000)
		await sendMessage(
			"Try adding the subject code and the color after the `--create` command",
			6000
		)
		return
	}

	const [, code, color] = FullCreateRegex
	const subjects = cache.getSubjects()
	if (subjects.indexOf(code) >= 0) {
		clear(5000)
		await sendMessage("Subject already exists!", 6000)
		return
	}

	await cache.changeSubject(code, color)
	await updateModifyChannelInline()

	// *
	clear(5000)
	await message.react(CHECK_MARK)
}
