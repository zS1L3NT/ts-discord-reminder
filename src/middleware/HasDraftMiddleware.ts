import { CommandHelper, CommandMiddleware, ResponseBuilder } from "nova-bot"

import Entry from "../data/Entry"
import GuildCache from "../data/GuildCache"

export default class extends CommandMiddleware<Entry, GuildCache> {
	handler(helper: CommandHelper<Entry, GuildCache>) {
		if (helper.string("reminder-id")) return true
		const draft = helper.cache.draft
		if (!draft) {
			helper.respond(ResponseBuilder.bad("No draft currently exists"))
			return false
		}
		return true
	}
}
