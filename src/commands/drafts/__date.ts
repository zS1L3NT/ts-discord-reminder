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
		CHECK_MARK
	] = params
	if (!match("^--date")) return
	dip("drafts--date")

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

	const FullDateRegex = match(
		"^--date (\\d{2})\\/(\\d{2})\\/(\\d{4}) (\\d{2}):(\\d{2})"
	)

	if (!FullDateRegex) {
		// : No new date given to draft
		clear(5000)
		await sendMessage(
			"Make sure the date is in the format `<DD>/<MM>/<YYYY> <hh>:<mm>`",
			6000
		)
		return
	}

	const date = verifyDate(FullDateRegex, async err => {
		// : Invalid date given to draft
		clear(5000)
		await sendMessage(err, 6000)
	})

	if (date instanceof Date) {
		await draft.setDate(date.getTime())
		await updateModifyChannelInline()

		// *
		clear(5000)
		await message.react(CHECK_MARK)
	}
}
