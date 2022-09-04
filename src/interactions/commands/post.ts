import { randomUUID } from "crypto"
import { Colors } from "discord.js"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import ReminderOrDraftMiddleware from "../../middleware/ReminderOrDraftMiddleware"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Convert a draft into an actual Reminder, then clears the draft"
	}

	override middleware = [new ReminderOrDraftMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const draft = helper.cache.draft!

		if (draft.due_date.getTime() < Date.now()) {
			return helper.respond(
				ResponseBuilder.bad("Existing draft due date is invalid, please set it again")
			)
		}

		if (draft.title === "") {
			return helper.respond(ResponseBuilder.bad("Existing draft has no title"))
		}

		draft.id = randomUUID()
		await helper.cache.prisma.reminder.update({
			where: { id_guild_id: { id: "draft", guild_id: helper.cache.guild.id } },
			data: draft.getReminder()
		})

		delete helper.cache.draft
		helper.cache.reminders.push(draft)

		helper.respond(ResponseBuilder.good("Posted draft to Reminder"))
		helper.cache.logger.log({
			member: helper.member,
			title: `Reminder Posted`,
			description: `<@${helper.member.id}> posted Reminder ${draft.id}`,
			command: "post",
			color: Colors.Yellow
		})
	}
}
