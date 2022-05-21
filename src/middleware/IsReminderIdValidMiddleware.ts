import { CommandHelper, CommandMiddleware, ResponseBuilder } from "nova-bot"

import Entry from "../data/Entry"
import GuildCache from "../data/GuildCache"

export default class extends CommandMiddleware<Entry, GuildCache> {
	handler(helper: CommandHelper<Entry, GuildCache>) {
		const reminderId = helper.string("reminder-id")
		const reminder = helper.cache.reminders.find(rm => rm.id === reminderId)
		if (!reminder) {
			helper.respond(ResponseBuilder.bad("Reminder with that ID doesn't exist"))
			return false
		}
		return true
	}
}
