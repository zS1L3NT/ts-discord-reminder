import { BaseCommand, CommandHelper } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import Reminder from "../../data/ReminderFull"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		name: "show",
		description: "Shows the current draft"
	}

	override middleware = []

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		helper.respond({
			embeds: [Reminder.toDraftEmbedBuilder(helper.cache.draft, helper.cache.guild)]
		})
	}
}
