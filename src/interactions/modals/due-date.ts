import { Colors, MessageType } from "discord.js"
import { useTry } from "no-try"
import { BaseModal, DateHelper, ModalHelper, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import logger from "../../logger"
import prisma from "../../prisma"

export default class extends BaseModal<typeof prisma, Entry, GuildCache> {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: ModalHelper<typeof prisma, Entry, GuildCache>) {
		const footerText = helper.message!.embeds[0]!.footer!.text!

		let error = null

		const dayStr = helper.text("day")!
		const monthStr = helper.text("month")!
		const yearStr = helper.text("year")!
		const hourStr = helper.text("hour")!
		const minuteStr = helper.text("minute")!

		const monthIndex = DateHelper.nameOfMonths
			.map(m => m.toLowerCase())
			.indexOf(monthStr.toLowerCase())
		const day = isNaN(+dayStr) ? ((error = "Day must be a number"), -1) : +dayStr
		const month = monthIndex === -1 ? ((error = "Month is not valid"), -1) : monthIndex
		const year = isNaN(+yearStr) ? ((error = "Year must be a number"), -1) : +yearStr
		const hour = isNaN(+hourStr) ? ((error = "Hour must be a number"), -1) : +hourStr
		const minute = isNaN(+minuteStr) ? ((error = "Minute must be a number"), -1) : +minuteStr

		const [err, dueDate] = useTry(
			() => new Date(DateHelper.verify(day, month, year, hour, minute).toMillis())
		)

		if (err) error = err.message

		if (error) {
			helper.update({
				embeds: [ResponseBuilder.bad(error).build()]
			})
		} else {
			let oldDueDate: Date
			if (footerText === "Draft") {
				oldDueDate = helper.cache.draft!.due_date
				helper.cache.draft!.due_date = new Date(dueDate)
				await helper.cache.prisma.reminder.update({
					where: {
						id_guild_id: {
							id: "draft",
							guild_id: helper.cache.guild.id
						}
					},
					data: {
						due_date: dueDate
					}
				})
			} else {
				const reminderId = footerText.slice(4)
				oldDueDate = helper.cache.reminders.find(r => r.id === reminderId)!.due_date
				await helper.cache.prisma.reminder.update({
					where: {
						id_guild_id: {
							id: reminderId,
							guild_id: helper.cache.guild.id
						}
					},
					data: {
						due_date: dueDate
					}
				})
			}

			await helper.update({
				embeds: [
					ResponseBuilder.good(
						`${footerText === "Draft" ? "Draft" : "Reminder"} due date updated`
					).build()
				]
			})
			helper.cache.logger.log({
				member: helper.member,
				title: `Due Date Updated`,
				description: [
					`<@${helper.member.id}> changed the due date of a Reminder`,
					`**Reminder ID**: ${footerText === "Draft" ? footerText : footerText.slice(4)}`,
					`**Old Due Date**: ${new DateHelper(oldDueDate.getTime()).getDate()}`,
					`**New Due Date**: ${new DateHelper(dueDate.getTime()).getDate()}`
				].join("\n"),
				command: "due-date",
				color: Colors.Yellow
			})
		}

		if (helper.message!.type !== MessageType.ChatInputCommand) {
			setTimeout(
				() =>
					helper
						.message!.delete()
						.catch(err => logger.log("Failed to delete message", err)),
				5000
			)
		}
	}
}
