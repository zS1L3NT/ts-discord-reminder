import { CommandHelper, CommandMiddleware, ResponseBuilder } from "nova-bot"

import Entry from "../data/Entry"
import GuildCache from "../data/GuildCache"

export default class extends CommandMiddleware<Entry, GuildCache> {
	override handler(helper: CommandHelper<Entry, GuildCache>) {
		const reminderId = helper.string("reminder-id")

		if (reminderId) {
			const reminder = helper.cache.reminders.find(rm => rm.id === reminderId)
			if (!reminder) {
				helper.respond(ResponseBuilder.bad("Reminder with that ID doesn't exist"))
				return false
			}
			return true
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				helper.respond(ResponseBuilder.bad("No draft currently exists"))
				return false
			}
			return true
		}
	}
}
