import DateFunctions from "../../utilities/DateFunctions"
import { iMessageParameters } from "../../utilities/MessageParameters"

export default async (parameters: iMessageParameters) => {
	const {
		dip,
		cache,
		Match,
		MatchMore,
		Clear,
		React,
		Respond,
		CHECK_MARK,
		CROSS_MARK
	} = parameters
	if (!MatchMore("--date")) return
	dip("drafts--date")

	const draft = cache.getDraft()
	if (!draft) {
		// : Cannot edit draft because draft doesn't exists
		Clear(5000)
		React(CROSS_MARK)
		Respond(
			"Try using `--create` to create an assignment draft first",
			6000
		)
		return
	}

	const FullDateRegex = Match(
		"^--date +(\\d{2})\\/(\\d{2})\\/(\\d{4}) +(\\d{2}):(\\d{2})"
	)

	if (!FullDateRegex) {
		// : No new date given to draft
		Clear(5000)
		React(CROSS_MARK)
		Respond(
			"Make sure the date is in the format `<DD>/<MM>/<YYYY> <hh>:<mm>`",
			6000
		)
		return
	}

	const date = DateFunctions.verify(FullDateRegex, async err => {
		// : Invalid date given to draft
		Clear(5000)
		React(CROSS_MARK)
		Respond(err, 6000)
	})

	if (date instanceof Date) {
		await draft.setDate(date.getTime())
		await cache.updateModifyChannelInline()

		// *
		Clear(5000)
		React(CHECK_MARK)
	}
}
