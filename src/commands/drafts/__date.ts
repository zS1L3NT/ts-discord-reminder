import { commandParams, verifyDate } from "../../all"

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
	if (!match("^--date(?:(?= *)(?!\\w+))")) return
	dip("drafts--date")

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

	const FullDateRegex = match(
		"^--date +(\\d{2})\\/(\\d{2})\\/(\\d{4}) +(\\d{2}):(\\d{2})"
	)

	if (!FullDateRegex) {
		// : No new date given to draft
		clear(5000)
		message.react(CROSS_MARK).then()
		sendMessage(
			"Make sure the date is in the format `<DD>/<MM>/<YYYY> <hh>:<mm>`",
			6000
		).then()
		return
	}

	const date = verifyDate(FullDateRegex, async err => {
		// : Invalid date given to draft
		clear(5000)
		message.react(CROSS_MARK).then()
		sendMessage(err, 6000).then()
	})

	if (date instanceof Date) {
		await draft.setDate(date.getTime())
		await updateModifyChannelInline()

		// *
		clear(5000)
		message.react(CHECK_MARK).then()
	}
}
