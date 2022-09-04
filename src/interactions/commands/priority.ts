import { Colors } from "discord.js"
import { BaseCommand, CommandHelper, CommandType, ResponseBuilder } from "nova-bot"

import { Entry, Priority } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import ReminderOrDraftMiddleware from "../../middleware/ReminderOrDraftMiddleware"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Edit the priority of a Reminder",
		options: [
			{
				name: "priority",
				description:
					"Can either be High(7d, 1d, 12h, 2h, 1h, 30m), Medium(1d, 2h) or Low priority",
				type: "string" as const,
				requirements: "Valid Priority",
				required: true,
				choices: [
					{
						name: "Low",
						value: "Low"
					},
					{
						name: "Medium",
						value: "Medium"
					},
					{
						name: "High",
						value: "High"
					}
				]
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
		const priority = helper.string("priority") as Priority | null

		if (priority === null) {
			return helper.respond(
				ResponseBuilder.bad('Invalid priority, must be either "low", "medium" or "high"')
			)
		}

		let oldPriority: Priority
		if (reminderId) {
			oldPriority = helper.cache.reminders.find(r => r.id === reminderId)!.priority
			await helper.cache.prisma.reminder.update({
				where: {
					id_guild_id: {
						id: reminderId,
						guild_id: helper.cache.guild.id
					}
				},
				data: {
					priority
				}
			})
		} else {
			oldPriority = helper.cache.draft!.priority
			helper.cache.draft!.priority = priority
			await helper.cache.prisma.reminder.update({
				where: {
					id_guild_id: {
						id: "draft",
						guild_id: helper.cache.guild.id
					}
				},
				data: {
					priority
				}
			})
		}

		await helper.respond({
			embeds: [
				ResponseBuilder.good(
					`${reminderId ? "Reminder" : "Draft"} priority updated`
				).build()
			]
		})

		helper.cache.logger.log({
			member: helper.member,
			title: `Priority Updated`,
			description: [
				`<@${helper.member.id}> changed the priority of a Reminder`,
				`**Reminder ID**: ${reminderId ?? "Draft"}`,
				`**Old Priority**: ${oldPriority}`,
				`**New Priority**: ${priority}`
			].join("\n"),
			command: "priority",
			color: Colors.Yellow
		})
	}
}
