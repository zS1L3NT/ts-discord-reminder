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
		updateNotifyChannelInline,
		CHECK_MARK
	] = params
	if (!match("^--done$")) return
	dip("drafts--done")

	const draft = cache.getDraft()
	if (!draft) {
		// :
		clear(5000)
		await sendMessage(
			"Try using `--create` to create an assignment draft first",
			6000
		)
		return
	}

	if (draft.getDate() < new Date().getTime()) {
		// :
		clear(5000)
		await sendMessage(
			"Try using `--date <DD>/<MM>/<YYYY> <hh>:<mm>` to add a date to the assignment",
			6000
		)
		return
	}

	if (draft.getName() === "") {
		clear(5000)
		await sendMessage(
			"Try using `--name <task name>` to add a name to the assignment",
			6000
		)
		return
	}

	if (draft.getSubject() === "") {
		clear(5000)
		await sendMessage(
			"Try using `--subject <subject name>` to add a subject to the assignment",
			6000
		)
		return
	}

	await cache.pushAssignment(draft)
	await cache.removeDraft()
	await updateNotifyChannelInline()
	await updateModifyChannelInline()

	// *
	clear(5000)
	await message.react(CHECK_MARK)
}
