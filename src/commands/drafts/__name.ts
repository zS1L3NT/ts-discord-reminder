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
		CHECK_MARK,
		CROSS_MARK
	] = params
	if (!match("^--name(?:(?= *)(?!\\w+))")) return
	dip("drafts--name")

	const draft = cache.getDraft()
	if (!draft) {
		// : Cannot edit draft because draft doesn't exists
		clear(5000)
		message.react(CROSS_MARK).then()
		sendMessage(
			"Try using `--create` to create an assignment draft first",
			6000
		).then()
		return
	}

	const FullNameRegex = match("^--name +(.+)")
	if (!FullNameRegex) {
		// : No new name given to draft
		clear(5000)
		message.react(CROSS_MARK).then()
		sendMessage("Make sure to add the name after the `--name`", 6000).then()
		return
	}

	const [, name] = FullNameRegex
	await draft.setName(name)
	await updateModifyChannelInline()

	// *
	clear(5000)
	message.react(CHECK_MARK).then()
}
