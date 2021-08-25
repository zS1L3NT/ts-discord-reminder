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
	if (!MatchMore("--info")) return
	dip("drafts--info")

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

	const AddInfoRegex = Match("^--info +\\+\\+ +(.+)")
	const RemoveInfoRegex = Match("^--info +-- +(\\d+)")

	if (AddInfoRegex) {
		const [info] = AddInfoRegex

		const draft = cache.getDraft()!
		await draft.pushDetail(info)
		await cache.updateModifyChannelInline()

		// *
		Clear(5000)
		React(CHECK_MARK)
	} else if (RemoveInfoRegex) {
		const [index] = RemoveInfoRegex

		const indexInt = parseInt(index) - 1
		if (indexInt < cache.getDraft()!.getDetails().length) {
			await draft.removeDetail(indexInt)
			await cache.updateModifyChannelInline()

			// *
			Clear(5000)
			React(CHECK_MARK)
		} else {
			// : Item doesn't exist
			Clear(5000)
			React(CROSS_MARK)
			Respond(`Info at index ${indexInt + 1} doesn't exist`, 6000)
		}
	} else {
		// : Invalid command
		Clear(5000)
		React(CROSS_MARK)
		Respond(
			"Try using `--info ++ <detail to add>` or `--info -- <index to remove>` to add or remove info",
			6000
		)
	}
}
