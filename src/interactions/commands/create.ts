import { Colors } from "discord.js"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import Reminder from "../../data/ReminderFull"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Creates a draft for a Reminder that you should make changes to"
	}

	override middleware = []

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>): boolean | void {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const draft = helper.cache.draft
		if (draft) {
			return helper.respond(
				ResponseBuilder.bad("Discard the existing draft before creating a new one")
			)
		}

		const reminder = Reminder.getEmpty()
		reminder.guild_id = helper.cache.guild.id
		reminder.id = "draft"

		helper.cache.draft = reminder
		await helper.cache.prisma.reminder.create({ data: reminder.getReminder() })

		helper.respond({
			embeds: [
				ResponseBuilder.good(`Created draft`).build(),
				Reminder.toDraftEmbedBuilder(helper.cache.draft, helper.cache.guild)
			]
		})
		helper.cache.logger.log({
			member: helper.member,
			title: `Draft Created`,
			description: `<@${helper.member.id}> created a draft`,
			command: "create",
			color: Colors.Green
		})
	}
}
