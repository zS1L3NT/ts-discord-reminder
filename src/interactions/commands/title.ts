import { Colors } from "discord.js"
import { BaseCommand, CommandHelper, CommandType, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import ReminderOrDraftMiddleware from "../../middleware/ReminderOrDraftMiddleware"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Edit the title of a Reminder",
		options: [
			{
				name: "title",
				description: "The title of a Reminder",
				type: "string" as const,
				requirements: "Text",
				required: true
			},
			{
				name: "reminder-id",
				description: "This is the ID of the Reminder to edit",
				type: "string" as const,
				requirements: "Valid Reminder ID",
				required: false,
				default: "Draft ID"
			}
		]
	}

	override only = CommandType.Slash

	override middleware = [new ReminderOrDraftMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const reminderId = helper.string("reminder-id")
		const title = helper.string("title")!

		let oldTitle: string
		if (reminderId) {
			oldTitle = helper.cache.reminders.find(r => r.id === reminderId)!.title
			await helper.cache.prisma.reminder.update({
				where: {
					id_guild_id: {
						id: reminderId,
						guild_id: helper.cache.guild.id
					}
				},
				data: {
					title
				}
			})
		} else {
			oldTitle = helper.cache.draft!.title
			helper.cache.draft!.title = title
			await helper.cache.prisma.reminder.update({
				where: {
					id_guild_id: {
						id: "draft",
						guild_id: helper.cache.guild.id
					}
				},
				data: {
					title
				}
			})
		}

		await helper.respond({
			embeds: [
				ResponseBuilder.good(`${reminderId ? "Reminder" : "Draft"} title updated`).build()
			],
			components: []
		})
		helper.cache.logger.log({
			member: helper.member,
			title: `Title Updated`,
			description: [
				`<@${helper.member.id}> changed the title of a Reminder`,
				`**Reminder ID**: ${reminderId ?? "Draft"}`,
				`**Old Title**: ${oldTitle}`,
				`**New Title**: ${title}`
			].join("\n"),
			command: "title",
			color: Colors.Yellow
		})
	}
}
