import { commandParams } from "../all"

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
	if (!match("^--name")) return
	dip("--name")

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

	const FullNameRegex = match("^--name (.+)")
	if (!FullNameRegex) {
		// : No new name given to draft
		clear(5000)
		await sendMessage("Make sure to add the name after the `--name`", 6000)
		return
	}

	const [, name] = FullNameRegex
	await draft.setName(name)
	await updateModifyChannelInline()

	// *
	clear(5000)
	await message.react(CHECK_MARK)
}
