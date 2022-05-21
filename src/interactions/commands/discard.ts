import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import HasDraftMiddleware from "../../middleware/HasDraftMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Discards a draft Reminder if it exists"
	}

	override middleware = [new HasDraftMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand("discard", "only")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		delete helper.cache.draft
		await helper.cache.getDraftDoc().delete()

		helper.respond(ResponseBuilder.good("Draft discarded"))
	}
}
