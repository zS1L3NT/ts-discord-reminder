import { CommandHelper, CommandMiddleware, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../data/GuildCache"
import prisma from "../prisma"

export default class extends CommandMiddleware<typeof prisma, Entry, GuildCache> {
	override handler(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const reminderId = helper.string("reminder-id")

		if (reminderId) {
			const reminder = helper.cache.reminders.find(r => r.id === reminderId)
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
