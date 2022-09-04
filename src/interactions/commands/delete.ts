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
		description: "Deletes a Reminder",
		options: [
			{
				name: "reminder-id",
				description: "This is the ID of the Reminder to edit",
				type: "string" as const,
				requirements: "Valid Reminder ID",
				required: true
			}
		]
	}

	override middleware = [new ReminderOrDraftMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>): boolean | void {
		return helper.isMessageCommand(true)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const [reminderId] = helper.args()
		return {
			"reminder-id": reminderId || ""
		}
	}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const reminderId = helper.string("reminder-id")!
		const reminder = helper.cache.reminders.find(r => r.id === reminderId)!

		helper.cache.reminders = helper.cache.reminders.filter(r => r.id !== reminderId)
		await helper.cache.prisma.reminder.delete({
			where: { id_guild_id: { id: reminderId, guild_id: helper.cache.guild.id } }
		})
		await helper.cache.prisma.ping.deleteMany({
			where: { reminder_id: reminder.id, guild_id: helper.cache.guild.id }
		})

		helper.cache.updateMinutely()
		helper.respond(ResponseBuilder.good(`Reminder deleted`))
		helper.cache.logger.log({
			member: helper.member,
			title: `Reminder deleted`,
			description: `<@${helper.member.id}> deleted a reminder`,
			command: "delete",
			color: Colors.Red,
			embeds: [reminder.toEmbedBuilder(helper.cache.guild).setColor("#000000")]
		})
	}
}
