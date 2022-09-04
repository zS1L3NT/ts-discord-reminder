import { TextChannel } from "discord.js"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Manually refresh the Reminders channel if it has been set"
	}

	override middleware = []

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const channel = await helper.cache.guild.channels.fetch(
			helper.cache.entry.reminders_channel_id ?? ""
		)
		if (channel instanceof TextChannel) {
			await helper.cache.updateMinutely()
			helper.respond(ResponseBuilder.good("Reminders channel refreshed"))
		} else {
			helper.respond(ResponseBuilder.bad("No Reminders channel set"))
		}
	}
}
