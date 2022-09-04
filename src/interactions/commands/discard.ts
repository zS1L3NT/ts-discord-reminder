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
		description: "Discards a draft Reminder if it exists"
	}

	override middleware = [new ReminderOrDraftMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const embed = helper.cache.draft?.toEmbedBuilder(helper.cache.guild)!

		delete helper.cache.draft
		await helper.cache.prisma.reminder.delete({
			where: { id_guild_id: { id: "draft", guild_id: helper.cache.guild.id } }
		})
		await helper.cache.prisma.ping.deleteMany({
			where: { reminder_id: "draft", guild_id: helper.cache.guild.id }
		})

		helper.respond(ResponseBuilder.good("Draft discarded"))
		helper.cache.logger.log({
			member: helper.member,
			title: `Draft Discarded`,
			description: `<@${helper.member.id}> discarded the draft`,
			command: "discard",
			color: Colors.Red,
			embeds: [embed.setColor("#000000")]
		})
	}
}
