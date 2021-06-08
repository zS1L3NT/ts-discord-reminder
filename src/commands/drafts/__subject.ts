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
	if (!match("^--subject")) return
	dip("drafts--subject")

	const draft = cache.getDraft()
	if (!draft) {
		// : Cannot edit draft because draft doesn't exists
		clear(5000)
		await sendMessage(
			"Try using `--create` to create an assignment draft first",
			6000
		)
		return
	}

	const FullSubjectRegex = match(
		`^--subject (${cache.getSubjects().join("|")})`
	)

	if (!FullSubjectRegex) {
		// : No new subject given to draft
		clear(5000)
		await sendMessage(`Make sure the subject is an existing subject`, 6000)
		return
	}

	const [, subject] = FullSubjectRegex
	await draft.setSubject(subject)
	await updateModifyChannelInline()

	// *
	clear(5000)
	await message.react(CHECK_MARK)
}
