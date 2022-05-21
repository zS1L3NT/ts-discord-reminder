import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import HasDraftMiddleware from "../../middleware/HasDraftMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Convert a draft into an actual Reminder, then clears the draft"
	}

	override middleware = [new HasDraftMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const draft = helper.cache.draft!

		if (draft.due_date < Date.now()) {
			return helper.respond(
				ResponseBuilder.bad("Existing draft due date is invalid, please set it again")
			)
		}

		if (draft.title === "") {
			return helper.respond(ResponseBuilder.bad("Existing draft has no title"))
		}

		const doc = helper.cache.getReminderDoc()
		draft.id = doc.id
		await doc.set(draft)
		delete helper.cache.draft
		await helper.cache.getDraftDoc().delete()

		helper.respond(ResponseBuilder.good("Posted draft to Reminder"))
	}
}
