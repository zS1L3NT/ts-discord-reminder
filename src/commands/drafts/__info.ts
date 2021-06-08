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
	if (!match("^--info")) return
	dip("drafts--info")

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

	const AddInfoRegex = match("^--info \\+\\+ (.+)")
	const RemoveInfoRegex = match("^--info -- (\\d+)")

	if (AddInfoRegex) {
		const [, info] = AddInfoRegex

		const draft = cache.getDraft()!
		await draft.pushDetail(info)
		await updateModifyChannelInline()

		// *
		clear(5000)
		await message.react(CHECK_MARK)
	} else if (RemoveInfoRegex) {
		const [, index] = RemoveInfoRegex

		const indexInt = parseInt(index) - 1
		if (indexInt < cache.getDraft()!.getDetails().length) {
			await draft.removeDetail(indexInt)
			await updateModifyChannelInline()

			// *
			clear(5000)
			await message.react(CHECK_MARK)
		} else {
			// : Item doesn't exist
			clear(5000)
			await sendMessage(
				`Info at index ${indexInt + 1} doesn't exist`,
				6000
			)
		}
	} else {
		// : Invalid command
		clear(5000)
		await sendMessage(
			"Try using `--info ++ <detail to add>` or `--info -- <index to remove>` to add or remove info",
			6000
		)
	}
}
